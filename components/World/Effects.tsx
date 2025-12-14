
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

export const Effects: React.FC = () => {
  return (
    <EffectComposer disableNormalPass multisampling={0}>
      {/* Optimized Bloom: Lower resolution kernel, fewer levels */}
      <Bloom 
        luminanceThreshold={0.8} 
        mipmapBlur 
        intensity={0.8} 
        radius={0.4}
        levels={4} // Reduced from 8 for performance
      />
      {/* Removed Noise effect as it is GPU intensive on mobile */}
      <Vignette eskil={false} offset={0.1} darkness={0.5} />
    </EffectComposer>
  );
};
