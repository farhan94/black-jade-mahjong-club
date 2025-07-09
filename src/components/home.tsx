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
  const [bamboo, setBamboo] = useState<any[]>([]);
  const [character, setCharacter] = useState<any[]>([]);
  const [dots, setDots] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const minLoadingTime = new Promise<void>((resolve) => {
      setTimeout(resolve, 1000);
    });

    const loadData = async () => {
      // Load metadata JSONs from the public data directory
      const [bambooRes, characterRes, dotsRes] = await Promise.all([
        fetch("/data/elementals-metadata/bamboo-bjmc-elementals-metadata.json"),
        fetch(
          "/data/elementals-metadata/character-bjmc-elementals-metadata.json"
        ),
        fetch("/data/elementals-metadata/dots-bjmc-elementals-metadata.json"),
      ]);
      const [bambooData, characterData, dotsData] = await Promise.all([
        bambooRes.json(),
        characterRes.json(),
        dotsRes.json(),
      ]);
      // Add owner info to each list
      if (isMounted) {
        setBamboo(bambooData);
        setCharacter(characterData);
        setDots(dotsData);
      }
    };

    Promise.all([minLoadingTime, loadData()]).then(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
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
          {/* Example usage: */}
          <pre>{JSON.stringify(bamboo, null, 2)}</pre>
          {/* ...other contents... */}
        </div>
      )}
    </div>
  );
}
