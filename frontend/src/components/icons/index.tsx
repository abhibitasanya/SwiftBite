import React from 'react';
import C from '../../theme/colors';

const Icon = {
  Home: ({ active }: { active?: boolean }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? C.red : 'none'} stroke={active ? C.red : C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Search: ({ active, color }: { active?: boolean; color?: string }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color || (active ? C.red : C.muted)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Bag: ({ active }: { active?: boolean }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? C.red : 'none'} stroke={active ? C.red : C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  ),
  User: ({ active }: { active?: boolean }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? C.red : 'none'} stroke={active ? C.red : C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Heart: ({ filled, size = 20 }: { filled?: boolean; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? C.red : 'none'} stroke={filled ? C.red : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  ),
  Star: ({ size = 12 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={C.orange} stroke={C.orange} strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Pin: ({ color = C.red }: { color?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Clock: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Back: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
  Plus: ({ color = 'white' }: { color?: string }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Check: ({ color = 'white', size = 14 }: { color?: string; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Bell: ({ active }: { active?: boolean }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? C.red : C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  Chevron: ({ dir = 'right', color = C.border }: { dir?: 'right' | 'down'; color?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      {dir === 'right' ? <polyline points="9 18 15 12 9 6"/> : <polyline points="6 9 12 15 18 9"/>}
    </svg>
  ),
  Filter: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
      <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
      <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/>
      <line x1="17" y1="16" x2="23" y2="16"/>
    </svg>
  ),
}


export default Icon;
