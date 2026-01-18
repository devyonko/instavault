import React from 'react';
import styles from './matrix-background.module.css';

const KATAKANA = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ";

export default function MatrixBackground() {
    // Generate a large array of characters to fill the screen
    // The original HTML had hundreds of spans. We'll repeat the Katakana string enough times.
    const chars = Array(12).fill(KATAKANA).join('').split('');

    return (
        <div className={styles.jpMatrix}>
            {chars.map((char, i) => (
                <span key={i}>{char}</span>
            ))}
        </div>
    );
}
