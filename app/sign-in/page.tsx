import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignInForm } from "@/components/auth-components/sign-in-form";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-lg">
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-3xl font-bold tracking-tight text-center text-black">
              Sign in
            </CardTitle>
            <CardDescription className="text-base text-center text-black/70">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <SignInForm />

            <div className="mt-6 text-center text-sm text-black/70">
              Don't have an account?{" "}
              <a
                href="/sign-up"
                className="font-medium text-black transition-colors hover:text-black/80 underline underline-offset-4 hover:cursor-pointer"
              >
                Sign up
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
