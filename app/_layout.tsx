import { Stack } from 'expo-router';
import Navbar from '../components/Navbar';

export default function RootLayout() {
  return (
    <>
      <Navbar />
      <Stack />
    </>
  );
}
