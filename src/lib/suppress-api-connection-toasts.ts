import { toast } from 'sonner';

import { isApiConnectionErrorMessage } from '@/lib/api';

const originalError = toast.error.bind(toast);

toast.error = ((message, data) => {
  if (isApiConnectionErrorMessage(message)) return '';
  if (
    data &&
    typeof data === 'object' &&
    'description' in data &&
    isApiConnectionErrorMessage(data.description)
  ) {
    return '';
  }
  return originalError(message, data);
}) as typeof toast.error;
