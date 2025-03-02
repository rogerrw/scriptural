import { Card, CardContent, CardHeader, CardTitle } from '@/component-library/card';
import LoginForm from './registerForm';
import Link from 'next/link';
import GoogleLogin from '../googleLogin';

const RegisterPage = () => {
  return (
    <div className="fadein flex justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Create a new account</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardContent>
          <Link href="/auth/signin">Already have an account?</Link>
        </CardContent>
        <CardContent>
          <GoogleLogin />
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
