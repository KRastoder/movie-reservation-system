"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { signUp } from "@/lib/auth-client"
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

const signUpSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .refine((val) => val.trim().length > 0, "Name cannot be empty or just spaces")
      .refine((val) => val.trim().length >= 2, "Name must be at least 2 characters")
      .refine((val) => /^[a-zA-Z\s\u00C0-\u024F\u1E00-\u1EFF]+$/.test(val.trim()), "Name can only contain letters and spaces"),
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
      .refine((val) => !/^\s|\s$/.test(val), "Password cannot start or end with spaces")
      .refine((val) => /[A-Z]/.test(val), "Password must contain at least one uppercase letter")
      .refine((val) => /[a-z]/.test(val), "Password must contain at least one lowercase letter")
      .refine((val) => /[0-9]/.test(val), "Password must contain at least one number"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type SignUpValues = z.infer<typeof signUpSchema>

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  })

  const onSubmit = async (values: SignUpValues) => {
    setIsLoading(true)
    setError("")

    try {
      const { error } = await signUp.email({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      })

      if (error) {
        setError(error.message || "An error occurred during sign up")
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-black">Full Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="John Doe"
                  className="h-11 px-4 transition-all duration-200 focus:ring-2 focus:ring-black/20"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-black/70" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-black">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  className="h-11 px-4 transition-all duration-200 focus:ring-2 focus:ring-black/20"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-black/70" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-black">Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="h-11 px-4 transition-all duration-200 focus:ring-2 focus:ring-black/20"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-black/70" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-black">Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="h-11 px-4 transition-all duration-200 focus:ring-2 focus:ring-black/20"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-black/70" />
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
            Account created successfully! Redirecting...
          </div>
        )}

        <Button
          type="submit"
          className="h-11 w-full text-base font-semibold transition-all duration-200 hover:shadow-md hover:cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </Form>
  )
}
