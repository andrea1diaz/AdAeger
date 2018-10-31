from flask_wtf import FlaskForm
from flask import session
from database import connector
from wtforms import StringField, PasswordField, BooleanField, SubmitField, \
TextAreaField, IntegerField, FloatField
from wtforms.validators import ValidationError, DataRequired, Email, EqualTo, \
Length
from model import entities
from model.entities import User


db = connector.Manager()
engine = db.createEngine()

class login_form(FlaskForm):
    username = StringField('username', validators=[DataRequired()])
    password = PasswordField('password', validators=[DataRequired()])
    remember_me = BooleanField('remember me')
    submit = SubmitField('Sign In')


class sign_up_form(FlaskForm):
    email = StringField('email', validators=[DataRequired(), Email()])
    username = StringField('username', validators=[DataRequired()])
    password = PasswordField('password', validators=[DataRequired()])
    password2 = PasswordField('confirm password', validators=[DataRequired(), EqualTo('password')])
    name = StringField('name', validators=[DataRequired()])
    submit = SubmitField('register')

    def validate_username(self, username):
        session = db.getSession(engine)
        user = session.query(entities.User).filter_by(username=username.data).first()
        if user is not None:
            raise ValidationError('username already being use')

    def validate_email(self, email):
        session = db.getSession(engine)
        user = session.query(entities.User).filter_by(email=email.data).first()
        if user is not None:
            raise ValidationError('email address alredy registered')


class edit_profile_form(FlaskForm):
    name = StringField('name', validators=[DataRequired()])
    lastname = StringField('lastname', validators=[DataRequired()])
    day = IntegerField('day', validators=[DataRequired()])
    month = StringField('month', validators=[DataRequired()])
    year = IntegerField('year', validators=[DataRequired()])
    blood_type = StringField('blood type', validators=[DataRequired()])
    weight = IntegerField('weight', validators=[DataRequired()])
    height = IntegerField('height', validators=[DataRequired()])
    submit = SubmitField('save')

class medication_form(FlaskForm):
    brand = StringField('brand', validators=[DataRequired()])
    drug = StringField('drug', validators=[DataRequired()])
    dosis = StringField('dosis', validators=[DataRequired()])
    prescribed_by = StringField('prescribed by', validators=[DataRequired()])
    diagnosis = StringField('diagnosis', validators=[DataRequired()])
    quantity = StringField('quantity', validators=[DataRequired()])
    submit = SubmitField('add')

    def validate_med(self, brand, dosis):
        session = db.getSession(engine)
        medicatioon = session.query(entities.User).filter_by(username=username.data).first()
        if user is not None:
            raise ValidationError('username already being use')


class symptom_form(FlaskForm):
    pain = IntegerField('pain')


# ---------------------- L A B O R A T O R I O S ---------------------
class hemograma_form(FlaskForm):
    day = IntegerField()
    month = StringField()
    year = IntegerField()
    doctor = StringField()
    rcto_hematies = IntegerField('rcto_hematies')
    rcto_leucocitos = IntegerField('rcto_leucocitos')
    eosinofilos = IntegerField('eosinofilos')
    basofilos = IntegerField()
    abastonados = IntegerField()
    segmentados = IntegerField()
    linfocitos = IntegerField()
    monocitos = IntegerField()
    diferencial_total = IntegerField()
    hemoglobina_hb = FloatField()
    hematocrito_hto = FloatField()
    volumen_corpuscular_media = FloatField()
    hemoglobina_corpuscular_media = FloatField()
    conc_hb_corpuscular_media = FloatField()
    eosinofilos_abs = IntegerField()
    basofilos_abs = IntegerField()
    abastonados_abs = IntegerField()
    segmentados_abs = IntegerField()
    linfocitos_abs = IntegerField()
    monocitos_abs = IntegerField()
    rcto_plaquetas = IntegerField()
    submit = SubmitField('add')
