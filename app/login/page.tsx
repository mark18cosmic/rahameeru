import React from "react";
import SignIn from "../components/authentication/Login";
import Navbar from "../components/Navbar";

const LoginPage = () => {
  return (
    <>
      {/* <Navbar /> */}
      <main className="min-h-screen flex items-center justify-center text-black">
        <div className="">
          <SignIn />
        </div>
      </main>
    </>
  );
};

export default LoginPage;
