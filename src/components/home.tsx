"use client";
import React, { useState, useEffect } from "react";

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

interface ElementalMetadata {
  id: string;
  name: string;
  description?: string;
  image?: string;
  // Add other properties as needed
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [bamboo, setBamboo] = useState<ElementalMetadata[]>([]);
  const [character, setCharacter] = useState<ElementalMetadata[]>([]);
  const [dots, setDots] = useState<ElementalMetadata[]>([]);

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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div>
              <h2 className="text-xl font-bold mb-2">Bamboo ({bamboo.length})</h2>
              <pre className="text-xs overflow-auto h-40">{JSON.stringify(bamboo, null, 2)}</pre>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Character ({character.length})</h2>
              <pre className="text-xs overflow-auto h-40">{JSON.stringify(character, null, 2)}</pre>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Dots ({dots.length})</h2>
              <pre className="text-xs overflow-auto h-40">{JSON.stringify(dots, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
