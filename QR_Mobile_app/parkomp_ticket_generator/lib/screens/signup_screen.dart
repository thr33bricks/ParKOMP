import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:email_validator/email_validator.dart';
import 'package:parkomp_ticket_generator/widgets/beauty_textfield.dart';

class SignUpScreen extends StatefulWidget {
  @override
  _SignUpScreenState createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final _formKey = GlobalKey<FormState>();

  Widget _terms() {
    return Expanded(
      child: Align(
        alignment: FractionalOffset.bottomCenter,
        child: Padding(
          padding: EdgeInsets.only(bottom: 10.0),
          child: FlatButton(
            onPressed: () => {print("Terms pressed.")},
            child: Text(
              "Terms & Conditions",
              style: GoogleFonts.montserrat(
                textStyle: TextStyle(
                  color: Color(0xffA6B0BD),
                  fontWeight: FontWeight.w400,
                  fontSize: 12,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _signIn() {
    return FlatButton(
      onPressed: () => {Navigator.pop(context)},
      child: Text(
        "SIGN IN",
        style: GoogleFonts.montserrat(
          textStyle: TextStyle(
            color: Theme.of(context).accentColor,
            fontWeight: FontWeight.w600,
            fontSize: 16,
          ),
        ),
      ),
    );
  }

  Widget _haveAcnt() {
    return Text(
      "Already have an account?",
      style: GoogleFonts.montserrat(
        textStyle: TextStyle(
          color: Color(0xffA6B0BD),
          fontWeight: FontWeight.w400,
          fontSize: 18,
        ),
      ),
    );
  }

  Widget _signUpBtn() {
    return Container(
      width: 250,
      margin: EdgeInsets.only(top: 20, bottom: 30),
      decoration: BoxDecoration(
          color: Theme.of(context).primaryColor,
          borderRadius: BorderRadius.all(Radius.circular(50)),
          boxShadow: [
            BoxShadow(
              color: Theme.of(context).primaryColor,
              blurRadius: 10,
              offset: Offset(0, 5),
              spreadRadius: 0,
            ),
          ]),
      child: FlatButton(
        onPressed: () => signUpClicked(),
        padding: EdgeInsets.symmetric(vertical: 20),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(50)),
        child: Text(
          "SIGN UP",
          style: GoogleFonts.montserrat(
            textStyle: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: Colors.white,
              letterSpacing: 3,
            ),
          ),
        ),
      ),
    );
  }

  void signUpClicked() {
    if (_formKey.currentState.validate()) {
      Navigator.pop(context);
    }
  }

  Widget _inputField(Icon prefixIcon, String hintText, bool isPassword) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.all(
          Radius.circular(50),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black,
            blurRadius: 25,
            offset: Offset(0, 5),
            spreadRadius: -25,
          ),
        ],
      ),
      margin: EdgeInsets.only(bottom: 20),
      child: BeautyTextfield(
        width: double.maxFinite, //REQUIRED
        height: 60, //REQUIRED
        accentColor: Colors.white, // On Focus Color
        textColor: Color(0xffA6B0BD), //Text Color
        backgroundColor: Color(0xffA6B0BD), //Not Focused Color
        autocorrect: false,
        autofocus: false,
        enabled: true, // Textfield enabled
        focusNode: FocusNode(),
        fontFamily: 'GoogleFonts.montserrat', //Text Fontfamily
        //fontStyle: FontStyle.italic,
        fontWeight: FontWeight.w400,
        minLines: 1,
        maxLines: 1,
        //wordSpacing: 2,
        margin: EdgeInsets.all(10),
        cornerRadius: BorderRadius.all(Radius.circular(33)),
        duration: Duration(milliseconds: 300),
        inputType: TextInputType.text, //REQUIRED
        placeholder: hintText,
        validator: isPassword
            ? (value) => value == '' ? 'Please enter your password' : null
            : (value) => EmailValidator.validate(value)
                ? null
                : 'Please enter a valid email',
        isShadow: true,
        obscureText: isPassword,
        prefixIcon: prefixIcon, //REQUIRED
        onTap: () {
          print('Click');
        },
        onChanged: (text) {
          print(text);
        },
        onSubmitted: (data) {
          print(data.length);
        },
      ),
    );
  }

  Widget _form() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          _inputField(
              Icon(Icons.person_outline, size: 30, color: Color(0xffA6B0BD)),
              "Email",
              false),
          _inputField(
              Icon(Icons.lock_outline, size: 30, color: Color(0xffA6B0BD)),
              "Password",
              true),
        ],
      ),
    );
  }

  Widget _logo() {
    return Padding(
      padding: const EdgeInsets.only(top: 70, bottom: 20),
      child: Image(
        alignment: Alignment.center,
        height: 100.0,
        width: 300.0,
        image: AssetImage('assets/images/parkomp_logo.png'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 40),
          color: Color(0xFFfafafa),
          width: double.infinity,
          child: Column(
            children: [
              _logo(),
              _form(),
              _signUpBtn(),
              _haveAcnt(),
              _signIn(),
              _terms(),
            ],
          ),
        ),
      ),
    );
  }
}
