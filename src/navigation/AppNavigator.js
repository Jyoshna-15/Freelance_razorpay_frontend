import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import PhoneScreen from '../screens/auth/PhoneScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ClientsScreen from '../screens/clients/ClientsScreen';
import AddClientScreen from '../screens/clients/AddClientScreen';
import InvoicesScreen from '../screens/invoices/InvoicesScreen';
import AddInvoiceScreen from '../screens/invoices/AddInvoiceScreen';
import InvoiceDetailScreen from '../screens/invoices/InvoiceDetailScreen';

const Stack = createNativeStackNavigator();

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
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Clients" component={ClientsScreen} />
            <Stack.Screen name="AddClient" component={AddClientScreen} />
            <Stack.Screen name="Invoices" component={InvoicesScreen} />
            <Stack.Screen name="AddInvoice" component={AddInvoiceScreen} />
            <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}