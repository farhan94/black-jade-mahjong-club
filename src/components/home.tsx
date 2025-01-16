"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

/*
use canvas?
 Use azuki cloud overlay pic with the mask
 move it through the page over and over.

 once page loads, fade the clouds out use the transition cloud pics
 to create an animation like sequence of "smoke" aka clouds
 moving to the edges of the screen.

 At that point, put a mask over everything except the edges
 and continue the cloud animation. it should only show on the
 edges now. OR you can do an inverse clip so that it only shows on the edges

*/
export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const minLoadingTime = new Promise<void>((resolve) => {
      setTimeout(resolve, 5000);
    });

    const loadData = async () => {
      // Simulate data loading
      await new Promise<void>((resolve) => setTimeout(resolve, 2000));
    };

    Promise.all([minLoadingTime, loadData()]).then(() => {
      setLoading(false);
    });
  }, []);

  return (
    <div>
      {loading ? (
        <div style={{ color: "white" }}>
          <h1>Loading...</h1>
        </div>
      ) : (
        <div>
          {/* Underlying contents go here */}
          <h1>Welcome to the Home Page</h1>
          {/* ...other contents... */}
        </div>
      )}
    </div>
  );
}
