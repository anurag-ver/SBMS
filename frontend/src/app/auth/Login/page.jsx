import { useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { axiosClient } from "../../../utils/AxiosClient";
import { useMainContext } from "../../../context/MainContext";

const initialValues = {
  email: "",
  password: "",
};

const validationSchema = yup.object({
  email: yup.string().email("Enter a valid email address").required("Email is required"),
  password: yup.string().required("Password is required"),
});

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { fetchUserProfile } = useMainContext();
  const navigate = useNavigate();

  const onSubmitHandler = async (values, helpers) => {
    try {
      setLoading(true);
      const { data } = await axiosClient.post("/auth/login", values);

      toast.success(data.msg);
      localStorage.setItem("token", data.token);
      await fetchUserProfile();
      helpers.resetForm();
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.msg || error.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#f7f8fc] text-slate-900">
      <main className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-7xl items-center gap-8 px-5 py-6 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-8">
        <section className="relative hidden overflow-hidden rounded-3xl bg-[#1e2678] p-10 text-white shadow-2xl lg:block">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-400/20 blur-2xl" />
          <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-cyan-300/10 blur-2xl" />

          <div className="relative flex min-h-[480px] flex-col justify-between">
            <div>
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-indigo-100">
                WELCOME BACK
              </span>
              <h1 className="mt-8 max-w-md text-5xl font-bold leading-tight">Banking that moves with you.</h1>
              <p className="mt-5 max-w-md text-base leading-7 text-indigo-100">
                Sign in to securely manage your accounts, track your transactions, and stay in control.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
              <img src="/sbms_logo.png" alt="SBMS" className="h-14 w-auto rounded-lg bg-white px-3 py-2 object-contain" />
              <div className="mt-7 flex items-end justify-between">
                <div>
                  <p className="text-sm text-indigo-100">Always secure. Always available.</p>
                  <p className="mt-1 text-xl font-semibold">Your finances, in one place.</p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-full bg-white/15 text-xl" aria-hidden="true">↗</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold tracking-[0.14em] text-[#1e2678]">SIGN IN</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Welcome back to SBMS</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Enter your details to access your account.</p>
          </div>

          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmitHandler}>
            {({ touched, errors, isSubmitting }) => (
              <Form className="space-y-5" noValidate>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Email address</span>
                  <Field
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 ${
                      touched.email && errors.email ? "border-red-400" : "border-slate-200 focus:border-[#1e2678]"
                    }`}
                  />
                  <ErrorMessage name="email" component="span" className="mt-1.5 block text-xs text-red-600" />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
                  <Field
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 ${
                      touched.password && errors.password ? "border-red-400" : "border-slate-200 focus:border-[#1e2678]"
                    }`}
                  />
                  <ErrorMessage name="password" component="span" className="mt-1.5 block text-xs text-red-600" />
                </label>

                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-sm font-semibold text-[#1e2678] hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading || isSubmitting}
                  className="w-full rounded-xl bg-[#1e2678] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-[#171d60] focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading || isSubmitting ? "Signing in..." : "Sign in"}
                </button>
              </Form>
            )}
          </Formik>

          <p className="mt-7 text-center text-sm text-slate-500">
            New to SBMS?{" "}
            <Link to="/register" className="font-semibold text-[#1e2678] hover:underline">
              Create an account
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
