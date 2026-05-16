from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "fronted" / "src" / "mock" / "researchHighlights.generated.json"


@dataclass
class Highlight:
    id: str
    title: str
    organization: str
    source: str
    type: str
    domain: str
    tags: list[str]
    summary: str
    detail: str
    application: str
    maturity: str

    def as_dict(self) -> dict[str, object]:
        return {
            "id": self.id,
            "title": self.title,
            "organization": self.organization,
            "source": self.source,
            "type": self.type,
            "domain": self.domain,
            "tags": self.tags,
            "summary": self.summary,
            "detail": self.detail,
            "application": self.application,
            "maturity": self.maturity,
        }


FIELD_LABELS = [
    "行业领域",
    "技术简介",
    "技术优势",
    "产品服务",
    "应用场景",
    "知识产权",
    "联系方式",
]

XJTU_SECTION_RE = re.compile(
    r"(?:^|\n)\s*[一二三四五六七八九十]+[、.．]\s*"
    r"(项目简介|产品性能优势|技术指标（性能参数）|技术指标|市场前景及应用|技术成熟度|合作方式)\s*(?=\n|$)"
)


def pdfs_by_page_count() -> dict[int, Path]:
    result: dict[int, Path] = {}
    for path in ROOT.glob("*.pdf"):
        with pdfplumber.open(str(path)) as pdf:
            result[len(pdf.pages)] = path
    return result


def clean_text(text: str) -> str:
    text = text.replace("\u3000", " ")
    text = text.replace("�", ".")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def compact(text: str) -> str:
    text = clean_text(text)
    text = re.sub(r"\s*\n\s*", " ", text)
    text = re.sub(r"\s{2,}", " ", text)
    return text.strip(" ;；，,")


def clip(text: str, limit: int) -> str:
    text = compact(text)
    if len(text) <= limit:
        return text
    cut = text[:limit]
    sentence_end = max(cut.rfind("。"), cut.rfind("；"), cut.rfind(";"))
    if sentence_end >= int(limit * 0.55):
        return cut[: sentence_end + 1]
    return cut.rstrip() + "..."


def first_sentence(text: str, limit: int = 120) -> str:
    text = compact(text)
    if not text:
        return ""
    match = re.search(r"[。；;]", text)
    if match and match.start() <= limit:
        return text[: match.end()]
    return clip(text, limit)


def slugify(text: str, fallback: str) -> str:
    ascii_part = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    if ascii_part:
        return ascii_part[:80]
    digest = 0
    for char in text:
        digest = (digest * 131 + ord(char)) % 1_000_000_007
    return f"{fallback}-{digest:x}"


def dedupe_tags(tags: Iterable[str], limit: int = 4) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for tag in tags:
        tag = compact(tag)
        tag = re.sub(r"^[一二三四五六七八九十]+[、.．]\s*", "", tag)
        if not tag or tag in seen:
            continue
        if len(tag) > 18:
            tag = tag[:18]
        seen.add(tag)
        result.append(tag)
        if len(result) >= limit:
            break
    return result or ["科技成果"]


def infer_title_tags(title: str) -> list[str]:
    rules = [
        ("人工智能", ["人工智能", "大模型", "AI", "智能", "视觉", "机器人"]),
        ("新能源", ["新能源", "储能", "电池", "锂", "钠", "氢", "燃料"]),
        ("生物医药", ["医学", "医疗", "生物", "药", "细胞", "诊疗", "健康"]),
        ("先进材料", ["材料", "陶瓷", "石墨烯", "纤维", "合金", "涂层", "膜"]),
        ("智能制造", ["制造", "装备", "检测", "传感", "控制", "加工", "工艺"]),
        ("环保低碳", ["环保", "废水", "垃圾", "二氧化碳", "低碳", "回收"]),
        ("食品科技", ["食品", "发酵", "营养", "饮料", "乳", "酿造"]),
    ]
    tags: list[str] = []
    for tag, keys in rules:
        if any(key in title for key in keys):
            tags.append(tag)
    return tags


def extract_between(text: str, start: str, end_labels: Iterable[str]) -> str:
    pattern = re.escape(start) + r"\s*[:：]?\s*(.*?)"
    ends = [re.escape(label) + r"\s*[:：]?" for label in end_labels]
    if ends:
        pattern += r"(?=" + "|".join(ends) + r"|$)"
    else:
        pattern += r"$"
    match = re.search(pattern, text, flags=re.S)
    return clean_text(match.group(1)) if match else ""


def extract_label_fields(text: str, labels: list[str]) -> dict[str, str]:
    fields: dict[str, str] = {}
    for index, label in enumerate(labels):
        fields[label] = extract_between(text, label, labels[index + 1 :])
    return fields


def extract_sinolight(path: Path) -> list[Highlight]:
    highlights: list[Highlight] = []
    with pdfplumber.open(str(path)) as pdf:
        for page_index, page in enumerate(pdf.pages, start=1):
            text = clean_text(page.extract_text(x_tolerance=1.5, y_tolerance=3) or "")
            if "行业领域" not in text or "技术简介" not in text:
                continue

            lines = [line.strip() for line in text.splitlines() if line.strip()]
            title = next((line for line in lines if line not in FIELD_LABELS and not re.fullmatch(r"\d+", line)), "")
            if not title:
                continue

            fields = extract_label_fields(text, FIELD_LABELS)
            domain = compact(fields.get("行业领域", "保利中轻技术成果"))
            intro = fields.get("技术简介", "")
            advantages = fields.get("技术优势", "")
            services = fields.get("产品服务", "")
            application = fields.get("应用场景", "")
            ip = fields.get("知识产权", "")
            contact = fields.get("联系方式", "")

            detail_parts = [
                f"技术简介：{clip(intro, 360)}" if intro else "",
                f"技术优势：{clip(advantages, 360)}" if advantages else "",
                f"产品服务：{clip(services, 220)}" if services else "",
                f"知识产权：{clip(ip, 220)}" if ip else "",
            ]
            domain_tags = re.split(r"\s*[–—-]\s*|/|、", domain)
            tags = dedupe_tags([*domain_tags, *infer_title_tags(title)])
            maturity = "技术手册项目"
            if contact:
                maturity += f"；{clip(contact, 80)}"

            highlights.append(
                Highlight(
                    id=f"sinolight-{page_index}-{slugify(title, 'item')}",
                    title=compact(title),
                    organization="保利中轻",
                    source=f"《保利中轻技术手册（2026版）》第 {page_index} 页",
                    type="科技成果",
                    domain=domain or "保利中轻技术成果",
                    tags=tags,
                    summary=first_sentence(intro or advantages or services, 128),
                    detail=" ".join(part for part in detail_parts if part),
                    application=clip(application or services, 260),
                    maturity=maturity,
                )
            )
    return highlights


def crop_columns(page) -> list[str]:
    width = page.width
    height = page.height
    boxes = [(0, 0, width / 2, height), (width / 2, 0, width, height)]
    return [
        clean_text(page.crop(box).extract_text(x_tolerance=1.5, y_tolerance=3) or "")
        for box in boxes
    ]


def split_numbered_blocks(text: str, label: str) -> list[tuple[str, str]]:
    marker = re.compile(rf"(?m)^(\d+)\.{re.escape(label)}\s*[:：]\s*")
    matches = list(marker.finditer(text))
    blocks: list[tuple[str, str]] = []
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        blocks.append((match.group(1), text[match.end() : end]))
    return blocks


def extract_qdu(path: Path) -> list[Highlight]:
    patent_text_parts: list[str] = []
    project_text_parts: list[str] = []

    with pdfplumber.open(str(path)) as pdf:
        for page_index, page in enumerate(pdf.pages, start=1):
            if 3 <= page_index <= 12:
                patent_text_parts.extend(crop_columns(page))
            elif 13 <= page_index <= 26:
                project_text_parts.extend(crop_columns(page))

    highlights: list[Highlight] = []
    patent_text = "\n".join(patent_text_parts)
    patent_text = re.sub(r"青岛大学高价值专利汇编|优\s*势\s*产\s*业|新\s*兴\s*产\s*业|未\s*来\s*产\s*业", "", patent_text)

    for number, block in split_numbered_blocks(patent_text, "专利名称"):
        block = clean_text(block)
        title = extract_before(block, ["专利号"])
        patent_no = extract_between(block, "专利号", ["技术领域", "技术优势"])
        domain = extract_between(block, "技术领域", ["技术优势"]) or "专利技术"
        advantage = extract_between(block, "技术优势", [])
        if not title or not patent_no:
            continue
        domain_clean = compact(domain).replace("本发明属于", "").replace("本发明涉及", "").strip("。")
        tags = dedupe_tags([domain_clean, *infer_title_tags(title)])
        highlights.append(
            Highlight(
                id=f"qdu-patent-{number}-{slugify(title, 'patent')}",
                title=compact(title),
                organization="青岛大学",
                source="青岛大学高价值专利汇编",
                type="专利",
                domain=domain_clean or "专利技术",
                tags=tags,
                summary=first_sentence(advantage, 128),
                detail=f"技术领域：{clip(domain, 180)} 技术优势：{clip(advantage, 520)}",
                application=first_sentence(advantage, 160),
                maturity=f"专利号：{compact(patent_no)}",
            )
        )

    project_text = "\n".join(project_text_parts)
    project_text = re.sub(r"青岛大学可转化成果汇编", "", project_text)
    for number, block in split_numbered_blocks(project_text, "项目名称"):
        block = clean_text(block)
        title = extract_before(block, ["技 术 领域", "技术领域"])
        domain = extract_between(block, "技 术 领域", ["项目负责人"]) or extract_between(block, "技术领域", ["项目负责人"])
        owner = extract_between(block, "项目负责人", ["项 目 简介", "项 目 简 介", "项目简介"])
        intro = (
            extract_between(block, "项 目 简介", ["市 场 前景", "市 场 前 景", "市场前景"])
            or extract_between(block, "项 目 简 介", ["市 场 前景", "市 场 前 景", "市场前景"])
            or extract_between(block, "项目简介", ["市 场 前景", "市 场 前 景", "市场前景"])
        )
        market = (
            extract_between(block, "市 场 前景", [])
            or extract_between(block, "市 场 前 景", [])
            or extract_between(block, "市场前景", [])
        )
        if not title:
            continue
        tags = dedupe_tags(re.split(r"[、,，/]|与", compact(domain)) + infer_title_tags(title))
        highlights.append(
            Highlight(
                id=f"qdu-project-{number}-{slugify(title, 'project')}",
                title=compact(title),
                organization="青岛大学",
                source="青岛大学可转化成果汇编",
                type="可转化成果",
                domain=compact(domain) or "可转化成果",
                tags=tags,
                summary=first_sentence(intro or market, 128),
                detail=(
                    f"项目简介：{clip(intro, 560)}"
                    + (f" 项目负责人：{clip(owner, 180)}" if owner else "")
                ),
                application=clip(market, 300),
                maturity="可转化成果" + (f"；负责人：{clip(owner, 80)}" if owner else ""),
            )
        )

    return highlights


def extract_before(text: str, labels: list[str]) -> str:
    positions = [text.find(label) for label in labels if text.find(label) >= 0]
    end = min(positions) if positions else len(text)
    return clean_text(text[:end])


def parse_xjtu_toc(pdf) -> list[dict[str, object]]:
    text = "\n".join(pdf.pages[i].extract_text(x_tolerance=1.5, y_tolerance=3) or "" for i in range(5, 10))
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    current_category = ""
    entries: list[dict[str, object]] = []
    pending: list[str] = []

    def flush_pending() -> None:
        nonlocal pending
        if not pending:
            return
        raw = " ".join(pending)
        pending = []
        match = re.match(r"^(\d+)\.\s+(.+?)\s*[.\s·]{2,}\s*(\d+)\s*$", raw)
        if not match:
            match = re.match(r"^(\d+)\.\s+(.+?)\s+(\d+)\s*$", raw)
        if not match:
            return
        entries.append(
            {
                "number": match.group(1),
                "title": compact(match.group(2).replace(".", " ")),
                "page": int(match.group(3)),
                "category": current_category,
            }
        )

    for line in lines:
        category = re.match(r"^[一二三四五六七八九十]+、\s*(.+?)\s*[.\s·]{2,}\s*\d+\s*$", line)
        if category:
            flush_pending()
            current_category = compact(category.group(1))
            continue

        if re.match(r"^\d+\.\s+", line):
            flush_pending()
            pending = [line]
            if re.search(r"\d+\s*$", line) and re.search(r"[.·]{2,}", line):
                flush_pending()
            continue

        if pending:
            pending.append(line)
            if re.search(r"\d+\s*$", line):
                flush_pending()

    flush_pending()
    return entries


def xjtu_text_for_pages(pdf, start_page: int, end_page: int) -> str:
    parts: list[str] = []
    for page_number in range(start_page, end_page + 1):
        if page_number < 1 or page_number > len(pdf.pages):
            continue
        text = pdf.pages[page_number - 1].extract_text(x_tolerance=1.5, y_tolerance=3) or ""
        text = re.sub(r"官网：http://tlo\.xjtu\.edu\.cn/index\.htm", "", text)
        text = re.sub(r"详情咨询请扫文末二维码联系技术经理人", "", text)
        text = re.sub(r"^\s*\d+\s*$", "", text, flags=re.M)
        parts.append(text)
    return clean_text("\n".join(parts))


def xjtu_sections(text: str) -> dict[str, str]:
    matches = list(XJTU_SECTION_RE.finditer(text))
    sections: dict[str, str] = {}
    for index, match in enumerate(matches):
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        sections[match.group(1)] = clean_text(text[start:end])
    return sections


def parse_checked_options(text: str, options: list[str]) -> list[str]:
    result: list[str] = []
    for option in options:
        if re.search(r"\s*" + re.escape(option), text):
            result.append(option)
    return result


def extract_xjtu(path: Path) -> list[Highlight]:
    highlights: list[Highlight] = []
    with pdfplumber.open(str(path)) as pdf:
        entries = parse_xjtu_toc(pdf)
        for index, entry in enumerate(entries):
            start_pdf_page = int(entry["page"]) + 12
            end_pdf_page = (int(entries[index + 1]["page"]) + 12 - 1) if index + 1 < len(entries) else len(pdf.pages)
            text = xjtu_text_for_pages(pdf, start_pdf_page, end_pdf_page)
            sections = xjtu_sections(text)
            title = str(entry["title"])
            category = str(entry["category"] or "科技成果")

            intro = sections.get("项目简介", "")
            advantage = sections.get("产品性能优势", "") or sections.get("技术指标（性能参数）", "") or sections.get("技术指标", "")
            market = sections.get("市场前景及应用", "")
            fallback_body = text
            fallback_body = fallback_body.replace(title, " ")
            fallback_body = fallback_body.replace(category, " ")
            fallback_body = re.sub(r"【[^】]+】[^\n]*", " ", fallback_body)
            fallback_body = compact(fallback_body)
            maturity_text = sections.get("技术成熟度", "")
            cooperation_text = sections.get("合作方式", "")
            team = extract_between(text, "【团队负责人】", ["【 所 在 学 院 】", "【所在学院】"])
            college = extract_between(text, "【 所 在 学 院 】", ["【技术经理人】", "一、", "一."])

            maturity_options = parse_checked_options(maturity_text, ["概念验证", "原理样机", "工程样机", "中试", "产业化"])
            cooperation_options = parse_checked_options(cooperation_text, ["联合研发", "技术入股", "转让", "授权（许可）", "面议"])
            maturity = "技术成熟度：" + ("、".join(maturity_options) if maturity_options else clip(maturity_text, 80) or "未标注")
            if cooperation_options:
                maturity += f"；合作方式：{'、'.join(cooperation_options)}"
            if team:
                maturity += f"；负责人：{clip(team, 60)}"

            tags = dedupe_tags([category, compact(college), *infer_title_tags(title)])
            detail_parts = [
                f"项目简介：{clip(intro, 520)}" if intro else "",
                f"性能优势：{clip(advantage, 420)}" if advantage else "",
            ]
            detail = " ".join(part for part in detail_parts if part) or clip(fallback_body, 640)
            application = clip(market or fallback_body, 300)
            highlights.append(
                Highlight(
                    id=f"xjtu-{entry['page']}-{slugify(title, 'project')}",
                    title=title,
                    organization="西安交通大学",
                    source=f"西安交通大学科技成果推广项目手册（2026 年）第 {entry['page']} 页",
                    type="科技成果",
                    domain=category,
                    tags=tags,
                    summary=first_sentence(intro or advantage or market or fallback_body, 128),
                    detail=detail,
                    application=application,
                    maturity=maturity,
                )
            )
    return highlights


def extract_sugon(path: Path) -> list[Highlight]:
    pages: dict[int, str] = {}
    with pdfplumber.open(str(path)) as pdf:
        for page_number in range(8, 18):
            pages[page_number] = compact(pdf.pages[page_number - 1].extract_text(x_tolerance=1.5, y_tolerance=3) or "")

    cards = [
        (
            "advanced-computing",
            "先进计算与智能计算底座",
            "先进计算",
            ["高性能计算", "智算中心", "算力底座"],
            "围绕高端计算机、服务器、存储、云计算和算力服务形成先进计算基础设施组合。",
            pages.get(9, "") + " " + pages.get(10, ""),
            "适合高校科研算力、制造业数字化、AI 训练推理和区域算力中心建设。",
        ),
        (
            "cpu-dcu",
            "高端通用 CPU 与 DCU 核心部件",
            "核心部件",
            ["CPU", "DCU", "自主可控"],
            "具备高端通用 CPU 和 DCU 产品能力，覆盖信息化、云计算、大数据、数值计算和 AI 训练推理。",
            pages.get(11, "") + " " + pages.get(12, ""),
            "适合国产化算力底座、AI 推理训练、云计算资源池和自主可控 IT 基础设施。",
        ),
        (
            "infrastructure",
            "高端计算机、服务器、存储与数据中心产品",
            "基础设施",
            ["服务器", "存储", "数据中心"],
            "基础设施产品覆盖高端计算机、服务器、EB 级存储、数据中心、网络安全、智慧工业与人工智能平台。",
            pages.get(13, "") + " " + pages.get(14, ""),
            "适合政企 IT 基础设施升级、工业数字化平台、数据中心扩容和网络安全建设。",
        ),
        (
            "green-data-center",
            "液冷绿色数据中心与一体化交付",
            "绿色计算",
            ["液冷", "PUE", "节能"],
            "液冷部署、绿色计算和数据中心建设运营能力可支撑低能耗算力基础设施。",
            pages.get(15, ""),
            "适用于城市云中心、先进计算中心、智算中心和一体化大数据中心建设。",
        ),
        (
            "platform-service",
            "云计算、行业服务与智慧工业平台服务",
            "平台服务",
            ["云计算", "行业服务", "智慧工业"],
            "提供计算服务、行业服务、云计算与智慧工业能力，连接科学计算、人工智能和工业计算资源。",
            pages.get(16, ""),
            "适合政务云、行业云、工业知识数字化和企业算力服务平台建设。",
        ),
        (
            "new-infrastructure",
            "先进计算中心、城市云中心与 5A 级智算中心",
            "新基建",
            ["先进计算中心", "城市云", "智算中心"],
            "构建先进计算中心、城市云中心、5A 级智算中心和一体化大数据中心等多样态新基建。",
            pages.get(17, ""),
            "适合地方新基建、科研教育算力服务、产业数字化平台和政企云能力建设。",
        ),
    ]

    return [
        Highlight(
            id=f"sugon-{slug}",
            title=title,
            organization="中科曙光",
            source="中科曙光公司简介（商业版）",
            type="企业能力",
            domain=domain,
            tags=tags,
            summary=summary,
            detail=clip(detail, 620),
            application=application,
            maturity="企业能力画像",
        )
        for slug, title, domain, tags, summary, detail, application in cards
    ]


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract project cards from local PDF files.")
    parser.add_argument("--output", type=Path, default=OUTPUT)
    args = parser.parse_args()

    by_pages = pdfs_by_page_count()
    highlights: list[Highlight] = []
    highlights.extend(extract_sugon(by_pages[21]))
    highlights.extend(extract_qdu(by_pages[26]))
    highlights.extend(extract_xjtu(by_pages[404]))
    highlights.extend(extract_sinolight(by_pages[176]))

    seen_ids: set[str] = set()
    data: list[dict[str, object]] = []
    for highlight in highlights:
        base_id = highlight.id
        suffix = 2
        while highlight.id in seen_ids:
            highlight.id = f"{base_id}-{suffix}"
            suffix += 1
        seen_ids.add(highlight.id)
        data.append(highlight.as_dict())

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    counts: dict[str, int] = {}
    for item in data:
        counts[str(item["organization"])] = counts.get(str(item["organization"]), 0) + 1
    print(f"Wrote {len(data)} project cards to {args.output}")
    for organization, count in sorted(counts.items()):
        print(f"- {organization}: {count}")


if __name__ == "__main__":
    main()
