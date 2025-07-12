import React from "react";
import Layout from "@theme/Layout";
import { Formik } from "formik";

function ContactForm() {
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState(false);

  const send = (email, name, message, setSubmitting) => {
    // use fetch to call api to localhost:8080/contact/send with email, name, message
    // if success, show success message
    // if error, show error message

    fetch("https://evershop.io/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name, message }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setSuccess(true);
        } else {
          setError(true);
        }
      })
      .catch((err) => {
        console.log(err);
        setError(true);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <header className="bg-green-conner bg-[#FCFCFC] py-16">
      <div className="container text-left pt-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-[100px] lg:gap-[170px]">
          <div className="">
            <h2 className="mb-2 w-full lg:w-[525px]">
              Let Us Help You Succeed -{" "}
              <span className="text-primary">Get in Touch</span> Today!
            </h2>
            <p>
              Have questions? Need tailored support? Our team is here to guide
              you every step of the way!
            </p>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-start gap-3">
                <div className="w-5 h-5 pt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none">
                    <g clip-path="url(#clip0_4348_5806)">
                      <path
                        d="M18.3327 9.23355V10.0002C18.3317 11.7972 17.7498 13.5458 16.6738 14.9851C15.5978 16.4244 14.0854 17.4773 12.3621 17.9868C10.6389 18.4963 8.79707 18.4351 7.11141 17.8124C5.42575 17.1896 3.98656 16.0386 3.00848 14.5311C2.0304 13.0236 1.56584 11.2403 1.68408 9.44714C1.80232 7.65402 2.49702 5.94715 3.66458 4.58111C4.83214 3.21506 6.41 2.26303 8.16284 1.867C9.91568 1.47097 11.7496 1.65216 13.391 2.38355M18.3327 3.33355L9.99935 11.6752L7.49935 9.17521"
                        stroke="#00764A"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_4348_5806">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div>
                  Suggestions for solutions to meet your specific needs and pain
                  points.
                </div>
              </div>
              <div className="flex justify-start gap-3">
                <div className="w-5 h-5 pt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none">
                    <g clip-path="url(#clip0_4348_5806)">
                      <path
                        d="M18.3327 9.23355V10.0002C18.3317 11.7972 17.7498 13.5458 16.6738 14.9851C15.5978 16.4244 14.0854 17.4773 12.3621 17.9868C10.6389 18.4963 8.79707 18.4351 7.11141 17.8124C5.42575 17.1896 3.98656 16.0386 3.00848 14.5311C2.0304 13.0236 1.56584 11.2403 1.68408 9.44714C1.80232 7.65402 2.49702 5.94715 3.66458 4.58111C4.83214 3.21506 6.41 2.26303 8.16284 1.867C9.91568 1.47097 11.7496 1.65216 13.391 2.38355M18.3327 3.33355L9.99935 11.6752L7.49935 9.17521"
                        stroke="#00764A"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_4348_5806">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div>
                  Guidance on EverShop-optimized hosting and vetted extensions.
                </div>
              </div>
              <div className="flex justify-start gap-3">
                <div className="w-5 h-5 pt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none">
                    <g clip-path="url(#clip0_4348_5806)">
                      <path
                        d="M18.3327 9.23355V10.0002C18.3317 11.7972 17.7498 13.5458 16.6738 14.9851C15.5978 16.4244 14.0854 17.4773 12.3621 17.9868C10.6389 18.4963 8.79707 18.4351 7.11141 17.8124C5.42575 17.1896 3.98656 16.0386 3.00848 14.5311C2.0304 13.0236 1.56584 11.2403 1.68408 9.44714C1.80232 7.65402 2.49702 5.94715 3.66458 4.58111C4.83214 3.21506 6.41 2.26303 8.16284 1.867C9.91568 1.47097 11.7496 1.65216 13.391 2.38355M18.3327 3.33355L9.99935 11.6752L7.49935 9.17521"
                        stroke="#00764A"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_4348_5806">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div>
                  Assistance with getting started and finding the right experts
                  to help build or upgrade your store.
                </div>
              </div>
            </div>
          </div>
          <div className="p-5 lg:p-10 border border-Neutrals-06 rounded-3xl relative bg-white shadow-extension">
            <Formik
              initialValues={{ email: "", name: "", message: "" }}
              validate={(values) => {
                const errors = {};
                if (!values.email) {
                  errors.email = "Email is required";
                } else if (
                  !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
                ) {
                  errors.email = "Invalid email address";
                }
                if (!values.name) {
                  errors.name = "Name is required";
                }
                if (!values.message) {
                  errors.message = "Message is required";
                }
                return errors;
              }}
              onSubmit={(values, { setSubmitting }) => {
                setSubmitting(true);
                send(values.email, values.name, values.message, setSubmitting);
              }}>
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
                /* and other goodies */
              }) => (
                <form onSubmit={handleSubmit}>
                  <div className="">
                    <div>
                      <label
                        htmlFor="email"
                        className="text-Neutrals-01 text-sm font-medium pb-1 block">
                        Your Email
                      </label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        name="email"
                        className="form-input p-3 border-Neutrals-06 rounded-lg block w-full"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.email}
                      />
                      {errors.email && touched.email && (
                        <span className="text-[#C60000]">{errors.email}</span>
                      )}
                    </div>
                    <div className="mt-6">
                      <label
                        htmlFor="email"
                        className="text-Neutrals-01 text-sm font-medium pb-1 block">
                        Your Name
                      </label>
                      <input
                        type="name"
                        placeholder="Enter your name"
                        name="name"
                        className="form-input p-3 border-Neutrals-06 rounded-lg block w-full"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.name}
                      />
                      {errors.name && touched.name && (
                        <span className="text-[#C60000]">{errors.name}</span>
                      )}
                    </div>
                    <div className="mt-6">
                      <label
                        htmlFor="email"
                        className="text-Neutrals-01 text-sm font-medium pb-1 block">
                        Message
                      </label>
                      <textarea
                        name="message"
                        placeholder="Enter your message"
                        className="form-input p-3 border-Neutrals-06 rounded-lg block w-full min-h-[128px]"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.message}
                      />
                      {errors.message && touched.message && (
                        <span className="text-[#C60000]">{errors.message}</span>
                      )}
                    </div>
                    {success && (
                      <div className="text-green-600 my-2">
                        Thank you! We will get back to you soon.
                      </div>
                    )}
                    {error && (
                      <div className="text-[#C60000] my-2">
                        Sorry! There was an error. Please try again later.
                      </div>
                    )}
                    <div className="mt-6">
                      <button
                        className="button button--primary w-full p-3 text-base"
                        type="submit"
                        disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                      </button>
                      <p className="italic text-sm text-Neutrals-04 pt-1">
                        * Your information is secure with us.
                      </p>
                    </div>
                  </div>
                </form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function ContactUs() {
  return (
    <Layout
      title="Contact Us"
      description="Contact Us."
      wrapperClassName="contact__us">
      <main>
        <ContactForm />
      </main>
    </Layout>
  );
}
