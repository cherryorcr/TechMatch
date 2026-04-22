import { SuggestionCard } from '../../mock/home';

interface PromptSuggestionsProps {
  suggestions: SuggestionCard[];
  onSelect: (prompt: string) => void;
}

export function PromptSuggestions({ suggestions, onSelect }: PromptSuggestionsProps) {
  return (
    <section className="prompt-suggestions">
      <div className="section-caption">
        <span className="eyebrow">推荐提问</span>
        <span className="section-caption-note">点击后会自动填充输入框，你可以继续修改，再发起多轮匹配。</span>
      </div>

      <div className="prompt-grid">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            className="prompt-card"
            onClick={() => onSelect(suggestion.prompt)}
            type="button"
          >
            <strong>{suggestion.title}</strong>
            <p>{suggestion.prompt}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
