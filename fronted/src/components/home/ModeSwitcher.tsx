import { HomeModeConfig, HomeModeId } from '../../mock/home';

interface ModeSwitcherProps {
  modes: HomeModeConfig[];
  activeMode: HomeModeId;
  onChange: (mode: HomeModeId) => void;
}

export function ModeSwitcher({ modes, activeMode, onChange }: ModeSwitcherProps) {
  return (
    <section className="mode-switcher">
      <div className="section-caption">
        <span className="eyebrow">模式选择</span>
      </div>

      <div className="mode-pill-row">
        {modes.map((mode) => {
          const isActive = mode.id === activeMode;

          return (
            <button
              key={mode.id}
              className={isActive ? 'mode-switch-button mode-switch-button-active' : 'mode-switch-button'}
              onClick={() => onChange(mode.id)}
              type="button"
            >
              {mode.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
