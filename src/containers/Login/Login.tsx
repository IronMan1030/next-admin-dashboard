import React, { useContext, useState, useEffect } from "react";
import { Redirect, useHistory, useLocation } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { AuthContext } from "context/auth";
import {
  FormFields,
  FormLabel,
  FormTitle,
  Error,
} from "components/FormFields/FormFields";
import {
  Wrapper,
  FormWrapper,
  LogoImage,
  LogoWrapper,
  QRWrapper,
} from "./Login.style";
import Input from "components/Input/Input";
import Button from "components/Button/Button";
import Logoimage from "assets/image/PickBazar.png";

import QRCode from "qrcode.react";
import { useMutation, useSubscription, gql } from "@apollo/client";
import { v4 as uuidv4 } from "uuid";

const initialValues = {
  username: "",
  password: "",
};

const getLoginValidationSchema = () => {
  return Yup.object().shape({
    username: Yup.string().required("Username is Required!"),
    password: Yup.string().required("Password is Required!"),
  });
};

const MyInput = ({ field, form, ...props }) => {
  return <Input {...field} {...props} />;
};

export default () => {
  let history = useHistory();
  let location = useLocation();
  const { authenticate, isAuthenticated } = useContext(AuthContext);
  if (isAuthenticated) return <Redirect to={{ pathname: "/" }} />;

  let { from } = (location.state as any) || { from: { pathname: "/" } };
  let sessionToken = localStorage.getItem("myAuthToken");

  const [qrkey, setQRkey] = useState(uuidv4());
  const [isToken, setIsToken] = useState(sessionToken);

  const GET_JWT = gql`
    subscription {
      getMyToken(input: { qrKey: ${JSON.stringify(qrkey)} }) {
        jwt
      }
    }
  `;
  const SET_QRKey = gql`
    mutation {
      provideQRkey(input: { qrKey: ${JSON.stringify(qrkey)} })
    }
  `;
  const { data, loading, error } = useSubscription(GET_JWT);

  const [updateQRkey] = useMutation(SET_QRKey, {
    context: {
      headers: {
        Authorization:
          "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2MDQwMDI3NDMsImV4cCI6MTYzNTUzOTE2MSwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXSwidXNlcklEIjoiNWQwYjU1NTFkMDdmZmIwMDE3YmVkZWU2In0.03JgIsQlyqbViX8Nsg6iG01gWqKdh5ITo8j-Z2_vTBY",
      },
    },
  });

  updateQRkey();
  useEffect(() => {
    if (isToken) {
      authenticate({ username: "", password: "" }, () => {
        history.replace(from);
      });
    }

    if (data && !localStorage.getItem("myAuthToken")) {
      localStorage.setItem("myAuthToken", data.getMyToken.jwt);
    }
  }, [data]);

  let login = ({ username, password }) => {
    authenticate({ username, password, authToken: "" }, () => {
      history.replace(from);
    });
  };
  return (
    <Wrapper>
      <FormWrapper>
        <Formik
          initialValues={initialValues}
          onSubmit={login}
          render={({ errors, status, touched, isSubmitting }) => (
            <Form>
              <FormFields>
                <LogoWrapper>
                  <LogoImage src={Logoimage} alt="pickbazar-admin" />
                </LogoWrapper>
                <FormTitle>Log in to admin</FormTitle>
              </FormFields>
              <FormFields>
                <FormLabel>Username</FormLabel>
                <Field
                  type="email"
                  name="username"
                  component={MyInput}
                  placeholder="Ex: demo@demo.com"
                />
                {errors.username && touched.username && (
                  <Error>{errors.username}</Error>
                )}
              </FormFields>
              <FormFields>
                <FormLabel>Password</FormLabel>
                <Field
                  type="password"
                  name="password"
                  component={MyInput}
                  placeholder="Ex: demo"
                />
                {errors.password && touched.password && (
                  <Error>{errors.password}</Error>
                )}
              </FormFields>
              <Button
                type="submit"
                disabled={isSubmitting}
                overrides={{
                  BaseButton: {
                    style: ({ $theme }) => ({
                      width: "100%",
                      marginLeft: "auto",
                      borderTopLeftRadius: "3px",
                      borderTopRightRadius: "3px",
                      borderBottomLeftRadius: "3px",
                      borderBottomRightRadius: "3px",
                    }),
                  },
                }}
              >
                Submit
              </Button>

              <QRWrapper>
                <QRCode
                  value={"http://localhost:3000/login"}
                  level="M"
                  size={256}
                />
              </QRWrapper>
            </Form>
          )}
          validationSchema={getLoginValidationSchema}
        />
      </FormWrapper>
    </Wrapper>
  );
};
