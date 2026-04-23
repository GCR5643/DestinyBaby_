'use client';

import React, { createContext, useContext } from 'react';
import type { Element } from '@/types';

/**
 * OhengTheme — 현재 페이지/섹션의 오행 테마를 설정.
 * `data-oheng` 어트리뷰트로 CSS 변수(`--theme-*`)가 스코프됨.
 * 하위 Button의 `ribbon`/`hero`는 `--theme-*`를 참조하므로 자동 컬러 스위칭.
 */
const OhengThemeContext = createContext<Element | undefined>(undefined);

export function useOhengTheme() {
  return useContext(OhengThemeContext);
}

export interface OhengThemeProps {
  element?: Element;
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'main';
}

export function OhengTheme({ element, children, className, as: Tag = 'div' }: OhengThemeProps) {
  return (
    <OhengThemeContext.Provider value={element}>
      <Tag data-oheng={element} className={className}>
        {children}
      </Tag>
    </OhengThemeContext.Provider>
  );
}
