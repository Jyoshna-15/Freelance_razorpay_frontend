// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { useSelector } from 'react-redux';

// import PhoneScreen from '../screens/auth/PhoneScreen';
// import OTPScreen from '../screens/auth/OTPScreen';
// import DashboardScreen from '../screens/DashboardScreen';
// import ClientsScreen from '../screens/clients/ClientsScreen';
// import AddClientScreen from '../screens/clients/AddClientScreen';
// import InvoicesScreen from '../screens/invoices/InvoicesScreen';
// import AddInvoiceScreen from '../screens/invoices/AddInvoiceScreen';
// import InvoiceDetailScreen from '../screens/invoices/InvoiceDetailScreen';

// const Stack = createNativeStackNavigator();

// export default function AppNavigator() {
//   const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {!isLoggedIn ? (
//           <>
//             <Stack.Screen name="Phone" component={PhoneScreen} />
//             <Stack.Screen name="OTP" component={OTPScreen} />
//           </>
//         ) : (
//           <>
//             <Stack.Screen name="Dashboard" component={DashboardScreen} />
//             <Stack.Screen name="Clients" component={ClientsScreen} />
//             <Stack.Screen name="AddClient" component={AddClientScreen} />
//             <Stack.Screen name="Invoices" component={InvoicesScreen} />
//             <Stack.Screen name="AddInvoice" component={AddInvoiceScreen} />
//             <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
//           </>
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }



import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { Text } from 'react-native';

import PhoneScreen from '../screens/auth/PhoneScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ClientsScreen from '../screens/clients/ClientsScreen';
import AddClientScreen from '../screens/clients/AddClientScreen';
import InvoicesScreen from '../screens/invoices/InvoicesScreen';
import AddInvoiceScreen from '../screens/invoices/AddInvoiceScreen';
import InvoiceDetailScreen from '../screens/invoices/InvoiceDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A1A1A',
          borderTopColor: '#2A2A2A',
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#555',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Invoices"
        component={InvoicesScreen}
        options={{
          tabBarLabel: 'Invoices',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>🧾</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Clients"
        component={ClientsScreen}
        options={{
          tabBarLabel: 'Clients',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>👥</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="Phone" component={PhoneScreen} />
            <Stack.Screen name="OTP" component={OTPScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="AddClient" component={AddClientScreen} />
            <Stack.Screen name="AddInvoice" component={AddInvoiceScreen} />
            <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}