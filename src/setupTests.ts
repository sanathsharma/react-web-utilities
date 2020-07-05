/**
 * seting up test environment
 * @link https://medium.com/@the_teacher/how-to-test-console-output-console-log-console-warn-with-rtl-react-testing-library-and-jest-6df367736cf0
 * @link https://github.com/vercel/next.js/issues/8663
 */

import '@testing-library/jest-dom/extend-expect';
import { cleanup } from '@testing-library/react';

afterEach( cleanup );