// Clear old data and force reload
console.log('Clearing old localStorage data...');
localStorage.removeItem('germanLearningData');
localStorage.removeItem('dataVersion');
console.log('Cache cleared! Reloading...');
setTimeout(() => {
  window.location.reload();
}, 1000);
