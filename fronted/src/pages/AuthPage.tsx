import { useState } from 'react';

type AuthMode = 'login' | 'register';

const authContent = {
  login: {
    eyebrow: 'Welcome Back',
    title: '登录你的 TechMatch 账号',
    submitLabel: '继续登录',
    hint: '用于恢复历史对话、同步收藏和后续联调真实身份体系。',
  },
  register: {
    eyebrow: 'Create Account',
    title: '创建新的 TechMatch 账号',
    submitLabel: '创建账号',
    hint: '注册后可以保存会话、绑定企业身份并接入后端账户系统。',
  },
} as const;

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');

  const content = authContent[mode];

  return (
    <div className="auth-page">
      <section className="auth-shell">
        <div className="auth-brand">
          <span className="hero-brand-mark">
            <img alt="TechMatch" className="brand-logo" src="/techmatch-logo.svg" />
          </span>
          <div>
            <span className="eyebrow">{content.eyebrow}</span>
            <h1>{content.title}</h1>
            <p>{content.hint}</p>
          </div>
        </div>

        <div className="auth-layout">
          <section className="panel auth-card">
            <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
              <button
                type="button"
                className={mode === 'login' ? 'auth-tab auth-tab-active' : 'auth-tab'}
                onClick={() => setMode('login')}
              >
                登录
              </button>
              <button
                type="button"
                className={mode === 'register' ? 'auth-tab auth-tab-active' : 'auth-tab'}
                onClick={() => setMode('register')}
              >
                注册
              </button>
            </div>

            <form className="auth-form">
              {mode === 'register' ? (
                <label className="auth-field">
                  <span>姓名</span>
                  <input placeholder="输入你的姓名或团队名称" type="text" />
                </label>
              ) : null}

              <label className="auth-field">
                <span>邮箱</span>
                <input placeholder="name@company.com" type="email" />
              </label>

              <label className="auth-field">
                <span>密码</span>
                <input placeholder="至少 8 位字符" type="password" />
              </label>

              {mode === 'register' ? (
                <label className="auth-field">
                  <span>确认密码</span>
                  <input placeholder="再次输入密码" type="password" />
                </label>
              ) : null}

              <button className="auth-submit" type="button">
                {content.submitLabel}
              </button>
            </form>

            <div className="auth-divider">
              <span>或使用其他方式</span>
            </div>

            <div className="auth-secondary-actions">
              <button className="auth-secondary-button" type="button">
                使用企业邮箱验证码
              </button>
              <button className="auth-secondary-button" type="button">
                使用 GitHub 继续
              </button>
            </div>

            <p className="auth-footnote">
              这是前端示意界面，当前未接入真实认证接口。联调时可将提交按钮接到后端登录/注册接口。
            </p>
          </section>

          <aside className="panel auth-side-panel">
            <span className="eyebrow">Account Benefits</span>
            <h2>登录后你能做什么</h2>
            <ul className="auth-benefit-list">
              <li>同步历史会话、推荐记录和筛选偏好</li>
              <li>绑定企业或专家身份，区分联调用户角色</li>
              <li>后续接入邀请码、组织空间和权限控制</li>
            </ul>

            <div className="auth-preview-note">
              <strong>建议后端接口</strong>
              <p>`POST /api/auth/login`、`POST /api/auth/register`、`GET /api/auth/me`</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
