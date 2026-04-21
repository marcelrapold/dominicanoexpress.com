import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

const NAV   = '#00205B';
const NAV2  = '#0a2f7a';
const RED   = '#CE1126';
const WHITE = '#FFFFFF';

export default function handler() {
  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          background: `linear-gradient(140deg, ${NAV} 0%, ${NAV2} 100%)`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 80px 52px',
          fontFamily: "'Arial Black', Arial, sans-serif",
          position: 'relative',
          overflow: 'hidden',
        },
        children: [
          /* ── Left accent bar ── */
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                left: '0', top: '0',
                width: '10px', height: '100%',
                background: RED,
              },
            },
          },

          /* ── Top: brand name ── */
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      background: RED,
                      borderRadius: '6px',
                      width: '44px', height: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '26px',
                      fontWeight: '900',
                      color: WHITE,
                    },
                    children: 'DE',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '24px',
                      fontWeight: '700',
                      color: 'rgba(255,255,255,0.75)',
                      letterSpacing: '3px',
                      textTransform: 'uppercase',
                    },
                    children: 'Dominicano Express GmbH',
                  },
                },
              ],
            },
          },

          /* ── Center: headline ── */
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: '12px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '76px',
                      fontWeight: '900',
                      color: WHITE,
                      lineHeight: '1',
                      letterSpacing: '-2px',
                    },
                    children: 'Envíos Marítimos',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            background: '#DA291C',
                            borderRadius: '50%',
                            width: '64px', height: '64px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            fontWeight: '900',
                            color: WHITE,
                            flexShrink: '0',
                          },
                          children: 'CH',
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '52px',
                            fontWeight: '900',
                            color: 'rgba(255,255,255,0.45)',
                          },
                          children: '↔',
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '72px',
                            fontWeight: '900',
                            color: RED,
                            letterSpacing: '-2px',
                            lineHeight: '1',
                          },
                          children: 'Rep. Dominicana',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },

          /* ── Bottom: benefits + phone ── */
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              },
              children: [
                /* Benefits */
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', flexDirection: 'column', gap: '6px' },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            gap: '28px',
                            fontSize: '21px',
                            color: 'rgba(255,255,255,0.82)',
                            fontWeight: '600',
                          },
                          children: [
                            { type: 'span', props: { children: '✓ Puerta a Puerta' } },
                            { type: 'span', props: { children: '✓ Seguro Incluido' } },
                            { type: 'span', props: { children: '✓ 20+ Años' } },
                          ],
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '16px',
                            color: 'rgba(255,255,255,0.38)',
                            letterSpacing: '1px',
                          },
                          children: 'dominicanoexpress.rapold.io',
                        },
                      },
                    ],
                  },
                },
                /* Phone CTA */
                {
                  type: 'div',
                  props: {
                    style: {
                      background: RED,
                      padding: '18px 36px',
                      borderRadius: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '11px',
                            fontWeight: '700',
                            letterSpacing: '2px',
                            color: 'rgba(255,255,255,0.7)',
                            textTransform: 'uppercase',
                          },
                          children: 'WhatsApp & Llamadas',
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '30px',
                            fontWeight: '900',
                            color: WHITE,
                            letterSpacing: '-0.5px',
                          },
                          children: '+41 79 199 93 93',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    { width: 1200, height: 630 }
  );
}
