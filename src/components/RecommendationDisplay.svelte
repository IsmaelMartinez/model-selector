<script>
  export let recommendations = [];
  export let taskCategory = '';
  export let taskSubcategory = '';
  export let isLoading = false;
  
  function getEnvironmentalBadge(score) {
    switch (score) {
      case 1: return { label: 'Low Impact', class: 'env-low', icon: '🌱' };
      case 2: return { label: 'Medium Impact', class: 'env-medium', icon: '⚡' };
      case 3: return { label: 'High Impact', class: 'env-high', icon: '🔥' };
      default: return { label: 'Unknown', class: 'env-unknown', icon: '❓' };
    }
  }
  
  function getTierBadge(tier) {
    switch (tier) {
      case 'lightweight': return { label: 'Lightweight', class: 'tier-light', icon: '🪶' };
      case 'standard': return { label: 'Standard', class: 'tier-standard', icon: '⚖️' };
      case 'advanced': return { label: 'Advanced', class: 'tier-advanced', icon: '🚀' };
      default: return { label: tier, class: 'tier-unknown', icon: '📦' };
    }
  }
  
  function formatSize(sizeMB) {
    if (sizeMB < 1) return `${(sizeMB * 1000).toFixed(0)}KB`;
    if (sizeMB < 1000) return `${sizeMB.toFixed(1)}MB`;
    return `${(sizeMB / 1000).toFixed(1)}GB`;
  }
</script>

<div class="recommendations-container">
  {#if isLoading}
    <div class="loading-state" aria-live="polite">
      <div class="spinner-large"></div>
      <h2>Analyzing your task...</h2>
      <p>Finding the most efficient AI models for your needs</p>
    </div>
  {:else if recommendations.length > 0}
    <div class="recommendations-header">
      <h2>Recommended Models</h2>
      <p class="task-info">
        <strong>Task:</strong> {taskCategory} → {taskSubcategory}
        <span class="recommendations-count">({recommendations.length} models found)</span>
      </p>
      <p class="efficiency-note">
        <span class="icon">🌍</span>
        Ranked by environmental efficiency - smaller, more efficient models first
      </p>
    </div>
    
    <div class="recommendations-grid" role="list">
      {#each recommendations as model, index}
        {@const tierBadge = getTierBadge(model.tier)}
        {@const envBadge = getEnvironmentalBadge(model.environmentalScore)}
        <article class="model-card" role="listitem">
          <div class="model-header">
            <div class="model-title">
              <h3>{model.name}</h3>
              <div class="badges">
                
                <span class="badge tier {tierBadge.class}" title="{tierBadge.label} tier">
                  <span aria-hidden="true">{tierBadge.icon}</span>
                  {tierBadge.label}
                </span>
                
                <span class="badge env {envBadge.class}" title="{envBadge.label}">
                  <span aria-hidden="true">{envBadge.icon}</span>
                  {envBadge.label}
                </span>
              </div>
            </div>
            
            {#if index === 0}
              <div class="recommended-badge" title="Most environmentally efficient option">
                <span aria-hidden="true">⭐</span>
                <span class="visually-hidden">Most recommended</span>
                Top Pick
              </div>
            {/if}
          </div>
          
          <p class="model-description">{model.description}</p>
          
          <div class="model-stats">
            <div class="stat">
              <span class="stat-label">Size:</span>
              <span class="stat-value">{formatSize(model.sizeMB)}</span>
            </div>
            
            <div class="stat">
              <span class="stat-label">Accuracy:</span>
              <span class="stat-value">{(model.accuracy * 100).toFixed(1)}%</span>
            </div>
            
            <div class="stat">
              <span class="stat-label">Updated:</span>
              <span class="stat-value">{model.lastUpdated}</span>
            </div>
          </div>
          
          <div class="deployment-options">
            <span class="deployment-label">Deploy on:</span>
            <div class="deployment-tags">
              {#each model.deploymentOptions as option}
                <span class="deployment-tag">{option}</span>
              {/each}
            </div>
          </div>
          
          <div class="frameworks">
            <span class="frameworks-label">Frameworks:</span>
            <div class="framework-tags">
              {#each model.frameworks as framework}
                <span class="framework-tag">{framework}</span>
              {/each}
            </div>
          </div>
          
          <div class="model-actions">
            {#if model.huggingFaceId && !model.huggingFaceId.startsWith('placeholder/')}
              <a 
                href="https://huggingface.co/{model.huggingFaceId}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="action-link"
                aria-describedby="external-link-desc"
              >
                View on Hugging Face
                <span aria-hidden="true">↗</span>
              </a>
            {:else}
              <span class="placeholder-link">
                <span aria-hidden="true">📖</span>
                Reference Implementation
              </span>
            {/if}
          </div>
        </article>
      {/each}
    </div>
    
    <div id="external-link-desc" class="visually-hidden">
      Opens in a new tab
    </div>
  {:else}
    <div class="no-results">
      <h2>No models found</h2>
      <p>We couldn't find models for this task. Try describing your task differently.</p>
    </div>
  {/if}
</div>

<style>
  .recommendations-container {
    max-width: 900px;
    margin: 2rem auto 0;
  }
  
  .loading-state {
    text-align: center;
    padding: 3rem 1rem;
  }
  
  .spinner-large {
    width: 48px;
    height: 48px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid #48bb78;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
  
  .recommendations-header {
    margin-bottom: 2rem;
  }
  
  .recommendations-header h2 {
    margin: 0 0 0.5rem 0;
    color: #2d3748;
    font-size: 1.5rem;
  }
  
  .task-info {
    color: #4a5568;
    margin: 0 0 0.5rem 0;
  }
  
  .recommendations-count {
    color: #718096;
    font-weight: normal;
  }
  
  .efficiency-note {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #38a169;
    font-size: 0.9rem;
    background: #f0fff4;
    padding: 0.75rem;
    border-radius: 6px;
    border-left: 4px solid #38a169;
  }
  
  .recommendations-grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  }
  
  .model-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.2s ease;
    position: relative;
  }
  
  .model-card:hover,
  .model-card:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
  
  .model-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }
  
  .model-title h3 {
    margin: 0 0 0.5rem 0;
    color: #2d3748;
    font-size: 1.2rem;
  }
  
  .badges {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    border-radius: 16px;
    font-size: 0.75rem;
    font-weight: 500;
  }
  
  .badge.tier.tier-light { background: #c6f6d5; color: #22543d; }
  .badge.tier.tier-standard { background: #fed7c3; color: #9c4221; }
  .badge.tier.tier-advanced { background: #fbb6ce; color: #97266d; }
  
  .badge.env.env-low { background: #c6f6d5; color: #22543d; }
  .badge.env.env-medium { background: #fef5e7; color: #744210; }
  .badge.env.env-high { background: #fed7d7; color: #742a2a; }
  
  .recommended-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: linear-gradient(135deg, #ffd700, #ffb347);
    color: #744210;
    padding: 0.25rem 0.5rem;
    border-radius: 16px;
    font-size: 0.75rem;
    font-weight: 600;
    flex-shrink: 0;
  }
  
  .model-description {
    color: #4a5568;
    margin: 0 0 1rem 0;
    line-height: 1.5;
  }
  
  .model-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
    padding: 1rem;
    background: #f7fafc;
    border-radius: 8px;
  }
  
  .stat {
    text-align: center;
  }
  
  .stat-label {
    display: block;
    font-size: 0.75rem;
    color: #718096;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.25rem;
  }
  
  .stat-value {
    display: block;
    font-weight: 600;
    color: #2d3748;
  }
  
  .deployment-options,
  .frameworks {
    margin-bottom: 1rem;
  }
  
  .deployment-label,
  .frameworks-label {
    display: block;
    font-size: 0.875rem;
    color: #4a5568;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }
  
  .deployment-tags,
  .framework-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  
  .deployment-tag,
  .framework-tag {
    background: #edf2f7;
    color: #4a5568;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
  }
  
  .model-actions {
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
  }
  
  .action-link {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    color: #4299e1;
    text-decoration: none;
    font-weight: 500;
    font-size: 0.875rem;
  }
  
  .action-link:hover {
    color: #2b6cb0;
    text-decoration: underline;
  }
  
  .placeholder-link {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    color: #718096;
    font-weight: 500;
    font-size: 0.875rem;
    cursor: default;
  }
  
  .no-results {
    text-align: center;
    padding: 3rem 1rem;
    color: #718096;
  }
  
  .no-results h2 {
    color: #4a5568;
    margin-bottom: 0.5rem;
  }
  
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .recommendations-grid {
      grid-template-columns: 1fr;
    }
    
    .model-header {
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .model-stats {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (prefers-reduced-motion: reduce) {
    .model-card,
    .spinner-large {
      transition: none;
      animation: none;
    }
  }
</style>