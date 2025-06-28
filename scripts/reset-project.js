const fs = require('fs');
const path = require('path');

const root = process.cwd();
const appDir = path.join(root, 'app');
const appExampleDir = path.join(root, 'app-example');

function moveDirectory(source, destination) {
  if (fs.existsSync(source)) {
    // Remove destination if it exists
    if (fs.existsSync(destination)) {
      fs.rmSync(destination, { recursive: true, force: true });
    }
    
    // Move source to destination
    fs.renameSync(source, destination);
    console.log(`✅ Moved ${source} to ${destination}`);
  }
}

function createBlankAppDirectory() {
  // Create a minimal app directory with basic structure
  fs.mkdirSync(appDir, { recursive: true });
  
  // Create a basic _layout.tsx file
  const layoutContent = `import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
`;

  // Create a basic index.tsx file
  const indexContent = `import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to your fresh Expo app!</Text>
      <Text style={styles.subtitle}>Start building your app by editing this file.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
`;

  // Create a basic +not-found.tsx file
  const notFoundContent = `import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
`;

  fs.writeFileSync(path.join(appDir, '_layout.tsx'), layoutContent);
  fs.writeFileSync(path.join(appDir, 'index.tsx'), indexContent);
  fs.writeFileSync(path.join(appDir, '+not-found.tsx'), notFoundContent);
  
  console.log('✅ Created blank app directory with basic structure');
}

function main() {
  console.log('🔄 Resetting project...');
  
  // Move current app directory to app-example
  moveDirectory(appDir, appExampleDir);
  
  // Create a fresh, blank app directory
  createBlankAppDirectory();
  
  console.log('✅ Project reset complete!');
  console.log('');
  console.log('Your starter code has been moved to the app-example directory.');
  console.log('You can now start developing in the blank app directory.');
}

main();