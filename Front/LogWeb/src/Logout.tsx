import * as React from "react";
import { Form, Button, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Logout() {
   const navigate = useNavigate();

   React.useEffect(()=>{
    localStorage.removeItem("token");
    navigate("/login");
   },[navigate])

    return null;
}