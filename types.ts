/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// ... (önceki importlar aynı)

export enum ObjectType {
  ANSWER_BLOCK = 'ANSWER_BLOCK',
  // DECORATION kaldırıldı (kullanılmıyorsa) veya tutulabilir
  BONUS_POINT = 'BONUS_POINT', // Yeni: +50 Puan Kutusu
  OBSTACLE_BAD = 'OBSTACLE_BAD' // Kapuska ve Brokoli bu tipi kullanacak
}

// ... (QuestionType aynı kalıyor)

export interface GameObject {
  id: string;
  type: ObjectType;
  position: [number, number, number];
  active: boolean;
  text?: string;
  isCorrect?: boolean;
  color?: string;
  scale?: [number, number, number];
  subType?: 'KAPUSKA' | 'BROKOLI'; // Yeni: Engelin türünü ayırt etmek için
}

// ... (Diğer interface'ler aynı)

// LANE_WIDTH biraz daha geniş tutulabilir mobilde yan yana binmemesi için
export const LANE_WIDTH = 5.0; 
// ... (Diğer sabitler aynı)
