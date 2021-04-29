import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:parkomp_ticket_generator/screens/signin_screen.dart';

void main() {
  //Orientation locked to portrait
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations(
      [DeviceOrientation.portraitUp, DeviceOrientation.portraitDown]);

  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ParKomp tickets - DEMO',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primaryColor: Color(0xFF5EB34D),
        primaryColorLight: Color(0xFFcfcfcf),
        accentColor: Color(0xFF317ABF),
        scaffoldBackgroundColor: Color(0xFFe0e0e0),
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: SignInScreen(),
    );
  }
}
