import { HomeModeConfig, HomeModeId } from '../../mock/home';

interface ModeSwitcherProps {
  modes: HomeModeConfig[];
  activeMode: HomeModeId;
  onChange: (mode: HomeModeId) => void;
}

function getModeSwitchLabel(label: string) {
  return label.replace(/^Mode\s+\d+\s+/, '');
}

export function ModeSwitcher({ modes, activeMode, onChange }: ModeSwitcherProps) {
  return (
    <section className="mode-switcher">
      <div className="section-caption">
        <span className="eyebrow">模式选择</span>
        <span className="section-caption-note">切换用户角色后，提问引导和匹配逻辑会一起变化。</span>
      </div>

      <div className="mode-pill-row" role="tablist" aria-label="匹配模式切换">
        {modes.map((mode) => {
          const isActive = mode.id === activeMode;

          return (
            <button
              aria-pressed={isActive}
              key={mode.id}
              className={isActive ? 'mode-switch-button mode-switch-button-active' : 'mode-switch-button'}
              onClick={() => onChange(mode.id)}
              type="button"
            >
              {getModeSwitchLabel(mode.label)}
            </button>
          );
        })}
      </div>
    </section>
  );
}
