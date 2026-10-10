export function ButtonSpinner() {
  return <span className="button-spinner" aria-hidden="true" />
}

export default function LoadingButton({ loading, loadingText = 'Please wait…', children, disabled, ...props }) {
  return <button {...props} disabled={loading || disabled} aria-busy={loading}>
    {loading ? <><ButtonSpinner /> {loadingText}</> : children}
  </button>
}

