"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { signIn } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Loader2 } from "lucide-react"

const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .refine((val) => val.trim().length > 0, "Email cannot be empty or just spaces")
    .email("Please enter a valid email address")
    .refine((val) => !/\s/.test(val), "Email cannot contain spaces"),
  password: z
    .string()
    .min(1, "Password is required")
    .refine((val) => val.length >= 8, "Password must be at least 8 characters")
    .refine((val) => !/^\s|\s$/.test(val), "Password cannot start or end with spaces"),
})

type SignInValues = z.infer<typeof signInSchema>

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  })

  const onSubmit = async (values: SignInValues) => {
    setIsLoading(true)
    setError("")

    try {
      const { error } = await signIn.email({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      })

      if (error) {
        setError(error.message || "Invalid email or password")
        setIsLoading(false)
        return
      }

      setError("")
      setIsLoading(false)
      setTimeout(() => {
        router.push("/")
      }, 1000)
    } catch {
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  className="h-11 px-4 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="h-11 px-4 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {!error && form.formState.isSubmitSuccessful && (
          <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-600">
            Signed in successfully! Redirecting...
          </div>
        )}

        <Button
          type="submit"
          className="h-11 w-full text-base font-semibold transition-all duration-200 hover:shadow-md"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </Form>
  )
}
