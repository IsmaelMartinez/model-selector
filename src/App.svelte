<script>
  // Model Selector main app component
  let taskDescription = '';
  let recommendation = null;
  
  function handleSubmit() {
    // Placeholder for task processing logic
    recommendation = {
      task: 'text_classification',
      models: ['BERT', 'RoBERTa', 'DistilBERT'],
      hosting: 'cloud',
      summary: 'For text classification tasks, we recommend starting with DistilBERT for efficiency.'
    };
  }
</script>

<main>
  <h1>Model Selector</h1>
  <p>Describe your AI task and get personalized model recommendations</p>
  
  <form on:submit|preventDefault={handleSubmit}>
    <textarea 
      bind:value={taskDescription}
      placeholder="Describe your task, e.g., 'I want to classify customer support tickets'"
      rows="4"
    ></textarea>
    <button type="submit">Get Recommendations</button>
  </form>
  
  {#if recommendation}
    <div class="recommendation">
      <h2>Recommendation</h2>
      <p><strong>Task Type:</strong> {recommendation.task}</p>
      <p><strong>Suggested Models:</strong> {recommendation.models.join(', ')}</p>
      <p><strong>Hosting:</strong> {recommendation.hosting}</p>
      <p>{recommendation.summary}</p>
    </div>
  {/if}
</main>

<style>
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  textarea {
    width: 100%;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: inherit;
  }
  
  button {
    background: #4CAF50;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 1rem;
  }
  
  .recommendation {
    background: #f5f5f5;
    padding: 1.5rem;
    border-radius: 8px;
    margin-top: 2rem;
  }
</style>