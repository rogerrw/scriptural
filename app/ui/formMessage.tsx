import { CircleCheck, TriangleAlert } from 'lucide-react';
import { Alert, AlertDescription } from '@/component-library/alert';

interface FormMessageProps {
  message?: string;
}

const FormError = ({ message }: FormMessageProps) => {
  return message ? (
    <Alert variant="destructive" className="bg-red-500">
      <TriangleAlert className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  ) : (
    <></>
  );
};

const FormWarning = ({ message }: FormMessageProps) => {
  return message ? (
    <Alert variant="destructive">
      <TriangleAlert className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  ) : (
    <></>
  );
};

const FormSuccess = ({ message }: FormMessageProps) => {
  return message ? (
    <Alert className="bg-emerald-500">
      <CircleCheck className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  ) : (
    <></>
  );
};

export { FormError, FormWarning, FormSuccess };
