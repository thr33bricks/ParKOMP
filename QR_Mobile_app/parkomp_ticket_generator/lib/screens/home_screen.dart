import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:commons/commons.dart';

class HomeScreen extends StatefulWidget {
  final String generatedStr;
  HomeScreen({this.generatedStr});
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: EdgeInsets.symmetric(vertical: 30.0),
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.all(10.0),
              child: Image(
                alignment: Alignment.center,
                height: 50.0,
                width: 150.0,
                image: AssetImage('assets/images/parkomp_logo.png'),
              ),
            ),
            SizedBox(height: 20.0),
            Center(
              child: Container(
                height: 340,
                width: 340,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20.0),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black12,
                      offset: Offset(0.0, 2.0),
                      blurRadius: 6.0,
                    ),
                  ],
                ),
                child: QrImage(
                  data: widget.generatedStr,
                  version: QrVersions.auto,
                  size: 320.0,
                  errorCorrectionLevel: 2,
                  embeddedImage: AssetImage('assets/icon/p.png'),
                  embeddedImageStyle: QrEmbeddedImageStyle(
                    size: Size(60, 60),
                  ),
                ),
              ),
            ),
            SizedBox(height: 10.0),
            Padding(
                padding: const EdgeInsets.only(top: 15, right: 26),
                child: Align(
                  alignment: Alignment.centerRight,
                  child: Container(
                    height: 70.0,
                    width: 70.0,
                    child: Material(
                      shadowColor: Colors.grey[50],
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(35.0)),
                      elevation: 3.0,
                      child: IconButton(
                        color: Theme.of(context).primaryColor,
                        splashColor: Theme.of(context).primaryColorLight,
                        icon: Icon(FontAwesomeIcons.redoAlt),
                        onPressed: () {
                          infoDialog(
                            context,
                            'You will be able to generate a new one as soon'
                            ' as the current one is no longer valid',
                            title: "Ticket already generated!",
                          );
                        },
                      ),
                    ),
                  ),
                )),
            SizedBox(height: 20.0),
          ],
        ),
      ),
    );
  }
}
