import { useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { axiosClient } from "../../../utils/AxiosClient";
import { useMainContext } from "../../../context/MainContext";

const accountTypes = [
  { label: "Savings", value: "saving" },
  { label: "Current", value: "current" },
];

const initialValues = {
  name: "",
  email: "",
  password: "",
  acc_type: "",
};

const validationSchema = yup.object({
  name: yup.string().trim().required("Name is required"),
  email: yup.string().email("Enter a valid email address").required("Email is required"),
  password: yup.string().min(8, "Use at least 8 characters").required("Password is required"),
  acc_type: yup.string().oneOf(["saving", "current"], "Choose Savings or Current").required("Account type is required"),
});

export default function Register() {
  const [loading, setLoading] = useState(false);
  const { fetchUserProfile } = useMainContext();
  const navigate = useNavigate();

  const onSubmitHandler = async (values, helpers) => {
    try {
      setLoading(true);
      const { data } = await axiosClient.post("/auth/register", values);

      toast.success(data.msg);
      localStorage.setItem("token", data.token);
      await fetchUserProfile();
      helpers.resetForm();
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.msg || error.message || "Unable to create your account.");
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
                SECURE BANKING
              </span>
              <h1 className="mt-8 max-w-md text-5xl font-bold leading-tight">
                A better way to manage your money.
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-indigo-100">
                Open your SBMS account in a few simple steps and take control of your everyday banking.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
              <img
                src="/sbms_logo.png"
                alt="SBMS"
                className="h-14 w-auto rounded-lg bg-white px-3 py-2 object-contain"
              />
              <div className="mt-7 flex items-end justify-between">
                <div>
                  <p className="text-sm text-indigo-100">Your banking, simplified</p>
                  <p className="mt-1 text-xl font-semibold">Secure. Seamless. SBMS.</p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-full bg-white/15 text-xl" aria-hidden="true">
                  ↗
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold tracking-[0.14em] text-[#1e2678]">CREATE ACCOUNT</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Get started with SBMS</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Enter your details to create your account.</p>
          </div>

          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmitHandler}>
            {({ values, setFieldValue, isSubmitting, touched, errors }) => (
          <Form className="space-y-5" noValidate>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Full name</span>
              <Field
                type="text"
                name="name"
                placeholder="Enter your full name"
                autoComplete="name"
                required
                className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 ${
                  touched.name && errors.name ? "border-red-400" : "border-slate-200 focus:border-[#1e2678]"
                }`}
              />
              <ErrorMessage name="name" component="span" className="mt-1.5 block text-xs text-red-600" />
            </label>

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
                placeholder="Create a secure password"
                autoComplete="new-password"
                minLength="8"
                required
                className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 ${
                  touched.password && errors.password ? "border-red-400" : "border-slate-200 focus:border-[#1e2678]"
                }`}
              />
              <ErrorMessage name="password" component="span" className="mt-1.5 block text-xs text-red-600" />
            </label>

            <fieldset>
              <legend className="mb-2 block text-sm font-semibold text-slate-700">Account type</legend>
              <div className="grid grid-cols-2 gap-3">
                {accountTypes.map((type) => {
                  const isSelected = values.acc_type === type.value;

                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFieldValue("acc_type", type.value)}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
                        isSelected
                          ? "border-[#1e2678] bg-[#1e2678] text-white shadow-md shadow-indigo-200"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50"
                      }`}
                      aria-pressed={isSelected}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>
              <ErrorMessage name="acc_type" component="span" className="mt-1.5 block text-xs text-red-600" />
            </fieldset>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#1e2678] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-[#171d60] focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading || isSubmitting}
            >
              {loading || isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </Form>
            )}
          </Formik>

          <p className="mt-7 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-[#1e2678] hover:underline">
              Log in
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
