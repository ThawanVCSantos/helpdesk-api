export function makeTransactionRunner() {
  return {
    run: (operation) => operation(),
  };
}
