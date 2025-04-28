export function shuffleArray<T>(array: T[]) {
    const shuffled = array.slice(); // copy the array so we don't modify the original
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // swap elements
    }
    return shuffled;
  }