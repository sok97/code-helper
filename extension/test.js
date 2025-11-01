function calculateSum(arr) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total = total + arr[i];
  }
  return total;
}

const numbers = [1, 2, 3, 4, 5];
const result = calculateSum(numbers);
console.log('Result:', result);