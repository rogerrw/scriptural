import { Alert, AlertDescription } from '@/component-library/alert';
import { FaCheckCircle } from 'react-icons/fa';
import { IoWarning } from 'react-icons/io5';

interface FormMessageProps {
  message?: string;
}

const FormError = ({ message }: FormMessageProps) => {
  return message ? (
    <Alert variant="destructive">
      <IoWarning />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  ) : (
    <></>
  );
};

const FormWarning = ({ message }: FormMessageProps) => {
  return message ? (
    <Alert variant="destructive">
      <IoWarning />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  ) : (
    <></>
  );
};

const FormSuccess = ({ message }: FormMessageProps) => {
  return message ? (
    <Alert className="bg-emerald-500">
      <FaCheckCircle />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  ) : (
    <></>
  );
};

export { FormError, FormWarning, FormSuccess };
