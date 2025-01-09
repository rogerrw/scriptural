import { FaApple, FaFacebook } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

import { Button } from '@/component-library/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/component-library/card';
import { Input } from '@/component-library/input';
import { Label } from '@/component-library/label';

const SignInPage = () => {
  return (
    <div className="flex justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Log in to your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Email</Label>
                <Input placeholder="Enter your email address"></Input>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Password</Label>
                <Input placeholder="Enter your password"></Input>
              </div>
            </div>
          </form>
          <Button className="w-full">Login</Button>
        </CardContent>
        <CardContent>
          <p>or</p>
          <Button className="w-full">
            <FcGoogle />
            Login with Google
          </Button>
        </CardContent>
        <CardContent>
          <Button className="w-full">
            <FaFacebook />
            Login with Facebook
          </Button>
        </CardContent>
        <CardContent>
          <Button className="w-full">
            <FaApple />
            Login with Apple
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;
