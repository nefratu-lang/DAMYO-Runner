/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';

export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  SHOP = 'SHOP',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export enum ObjectType {
  ANSWER_BLOCK = 'ANSWER_BLOCK',
  DECORATION = 'DECORATION',
  POWERUP_HEAL = 'POWERUP_HEAL',
  OBSTACLE_BAD = 'OBSTACLE_BAD'
}

export enum QuestionType {
  PRESENT = 'PRESENT', // Green
  PAST = 'PAST',       // Red
  FUTURE = 'FUTURE',   // Blue
  MIXED = 'MIXED'      // Yellow
}

export interface GameObject {
  id: string;
  type: ObjectType;
  position: [number, number, number]; // x, y, z
  active: boolean;
  text?: string; // The answer text to display
  isCorrect?: boolean; // Is this the right answer?
  color?: string;
  scale?: [number, number, number];
}

export interface GrammarQuestion {
    id: string;
    sentence: string; 
    options: string[]; 
    correctIndex: number;
    type: QuestionType;
}

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    price: number;
    iconType: 'JUMP' | 'HEAL' | 'IMMORTAL';
}

export const LANE_WIDTH = 4.5; // Significantly wider for better readability
export const JUMP_HEIGHT = 2.5;
export const JUMP_DURATION = 0.6; // seconds
export const RUN_SPEED_BASE = 35.0; // Faster start
export const SPAWN_DISTANCE = 100;
export const REMOVE_DISTANCE = 20; // Behind player

// Tense Colors
export const TENSE_COLORS = {
    [QuestionType.PRESENT]: '#00e676', // Green
    [QuestionType.PAST]: '#ff1744',    // Red
    [QuestionType.FUTURE]: '#2979ff',  // Blue
    [QuestionType.MIXED]: '#ffea00',   // Yellow
};

export const LANE_COLORS = ['#ff00ff', '#00ffff', '#ffff00', '#ff0000'];

// Extend JSX.IntrinsicElements for React Three Fiber
// Declarations for both global JSX and React module JSX to ensure compatibility
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      points: any;
      bufferGeometry: any;
      bufferAttribute: any;
      pointsMaterial: any;
      planeGeometry: any;
      meshBasicMaterial: any;
      sphereGeometry: any;
      color: any;
      fog: any;
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
      meshStandardMaterial: any;
      boxGeometry: any;
      [elemName: string]: any;
    }
  }
}
