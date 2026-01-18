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
  BONUS_POINT = 'BONUS_POINT', // Yeni: Puan Kutusu
  OBSTACLE_BAD = 'OBSTACLE_BAD' // Kapuska ve Brokoli
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
  text?: string;
  isCorrect?: boolean;
  color?: string;
  scale?: [number, number, number];
  subType?: 'KAPUSKA' | 'BROKOLI'; // Engelin türü
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
    iconType: 'JUMP' | 'HEAL' | 'IMMORTAL' | 'ENERGY';
}

export const LANE_WIDTH = 5.0; // Mobilde daha rahat görünmesi için genişlettik
export const JUMP_HEIGHT = 2.5;
export const JUMP_DURATION = 0.6; 
export const RUN_SPEED_BASE = 35.0; 
export const SPAWN_DISTANCE = 100;
export const REMOVE_DISTANCE = 20;

export const TENSE_COLORS = {
    [QuestionType.PRESENT]: '#00e676',
    [QuestionType.PAST]: '#ff1744',
    [QuestionType.FUTURE]: '#2979ff',
    [QuestionType.MIXED]: '#ffea00',
};

export const LANE_COLORS = ['#ff00ff', '#00ffff', '#ffff00', '#ff0000'];

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
      cylinderGeometry: any;
      circleGeometry: any;
      [elemName: string]: any;
    }
  }
}
