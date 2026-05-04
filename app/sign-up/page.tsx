import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SignUpForm } from "@/components/auth-components/sign-up-form"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-lg">
        <Card className="shadow-lg">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-3xl font-bold tracking-tight text-center">
              Create an account
            </CardTitle>
            <CardDescription className="text-base text-center text-muted-foreground">
              Enter your details below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <SignUpForm />

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <a
                href="/sign-in"
                className="font-medium text-primary transition-colors hover:text-primary/80 underline underline-offset-4"
              >
                Sign in
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
