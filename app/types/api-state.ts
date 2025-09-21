// N States Architecture for API State Management
// Based on: https://dh00mk3tu.github.io/blogs/posts/n-states/

export type State = 'success' | 'failed' | 'loading' | 'idle'

export interface APIState {
  status: State
  message?: string
  data?: any
}

// State modifier utility for type-safe state updates
export const useStateModifier = (
  stateName: APIState,
  newState: State,
  newMessage?: string,
  newData?: any
): void => {
  stateName.status = newState
  if (newMessage) {
    stateName.message = newMessage
  }
  if (newData) {
    stateName.data = newData
  }
}
