from flask import Flask, Blueprint, render_template, request, session, \
Response, redirect, flash, url_for
from flask_httpauth import HTTPBasicAuth
from flask_login import login_user, logout_user, current_user, login_required,\
LoginManager
from model import entities, forms
from model.forms import login_form, sign_up_form, edit_profile_form,\
 medication_form, hemograma_form
from model.entities import User, Medication, Hemograma
from database import connector
import json
from wtforms import StringField, PasswordField
from wtforms.validators import DataRequired
from werkzeug.security import generate_password_hash
from werkzeug.urls import url_parse


app = Flask(__name__)
db = connector.Manager()
engine = db.createEngine()
login = LoginManager(app)
cache = {}

session = db.getSession(engine)


@login.user_loader
def get_user(ident):
    session = db.getSession(engine)
    return session.query(entities.User).get(int(ident))

@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect('/home')

    form = login_form()

    if form.validate_on_submit():
        user = users.query.filter_by(username=form.username.data).first()
        if user is None or not user.check_password(form.password.data):
            flash('Invalid username or password')
            return redirect('index.html', title='Sign In', form=form)
        login_user(user, remember=form.remember_me.data)

    return render_template('index.html', title='Sign In', form=form)


def data_list():
    session = db.getSession(engine)
    data = []
    for user_med in session.query(entities.User_med):
        for medications in user_med.medication:
            data.append(medications)
            return Response(json.dumps(data, cls=connector.AlchemyEncoder), mimetype='application/json')
    print(data)

def get_medicines():
    data = []
    session = db.getSession(engine)
    print("-------")
    for user_med in session.query(entities.User_med):
        for medications in user_med.medication:
            if session.query(entities.User_med).filter_by(user=current_user.id).first():
                data.append(medications.med_drug)
                print(medications.med_drug)
    print("-------")
    return data


@app.route('/home')
@login_required
def home():
    meds = get_medicines()
    session = db.getSession(engine)
    return render_template('inicio.html', title='HOME', meds=meds)

@app.route('/success')
def success():
    return render_template('success.html')


# --------------------- L O G   I N ----------------------
@app.route('/do_login', methods=['POST'])
def do_login():
    if current_user.is_authenticated:
        return redirect(url_for('home'))

    form = login_form()
    session = db.getSession(engine)

    if form.validate_on_submit():
        user = session.query(entities.User).filter_by(username=form.username.data).first()
        if user is None or not user.check_password(form.password.data):
            flash('Invalid username or password')
            return redirect('/')
        login_user(user, remember=form.remember_me.data)
        print('aqui')
        return redirect('/home')

    return render_template('home.html', title='Sign In', form=form)


@app.route('/app_login', methods=['POST'])
def app_login():
    print("Sending request login")
    body = request.get_json(silent=True)
    print(body)
    username = body['username']
    password = body['password']
    bool = True
    user = session.query(entities.User).filter_by(username=username).first()

    if user is not None:
        bool = False

    print(username)
    return Response(json.dumps({'response': bool }, cls=connector.AlchemyEncoder),
                    mimetype='application/json')


# --------------------- S I G N   U P ----------------------
@app.route('/sign_up', methods=['GET', 'POST'])
def sign_up():
    if current_user.is_authenticated:
        return redirect('/home')
    form = sign_up_form()
    session = db.getSession(engine)

    if form.validate_on_submit():
        user = User(username=form.username.data,
                    email=form.email.data,
                    name=form.name.data)
        user.set_password(form.password.data)
        session.add(user)
        session.commit()
        flash('Congratulations, you are now a registered user!')
        return redirect('/')
    return render_template('sign_up.html', title='Register', form=form)


# --------------------- L O G   O U T ----------------------
@app.route('/logout')
def logout():
    logout_user()
    return redirect('/')


# --------------- R E S E T   P A S S W O R D --------------
@app.route('/reset')
def reset_password():
    return render_template('reset_password.html')


# -------------------- P R O F I L E ----------------------
@app.route('/profile')
@login_required
def profile():
    session = db.getSession(engine)
    user = session.query(entities.User).first()
    return render_template('profile.html', user=user)

# edit profile
@app.route('/edit_profile', methods=['GET', 'POST'])
@login_required
def edit_profile():
    form = edit_profile_form()
    if request.method == 'POST':
        if form.validate_on_submit():
            current_user.name = form.name.data
            current_user.lastname = form.lastname.data
            current_user.day = form.day.data
            current_user.month = form.month.data
            current_user.year = form.year.data
            current_user.blood_type = form.blood_type.data
            current_user.weight = form.weight.data
            current_user.height = form.height.data

            session = db.getSession(engine)
            session.merge(current_user)
            session.commit()
            return redirect('/profile')

    elif request.method == 'GET':
        form.name.data = current_user.name
        form.lastname.data = current_user.lastname
        form.day.data = current_user.day
        form.month.data = current_user.month
        form.year.data = current_user.year
        form.blood_type.data = current_user.blood_type
        form.weight.data = current_user.weight
        form.height.data = current_user.height
    return render_template('edit_profile.html',
                           form=form)

# ---------------------- M E D I C A T I O N -------------------------
@app.route('/new_med', methods=['GET'])
@login_required
def new_med():
    meds = get_medicines()
    form = medication_form()
    return render_template('add_med.html', form=form, meds=meds)


@app.route('/add_new_med', methods=['POST'])
def add_new_med():
    meds = get_medicines()
    form = medication_form()
    med = entities.User_med(
            user=current_user.id,
            medication=[
                Medication(
                    med_brand_name=form.brand.data,
                    med_drug=form.drug.data,
                    med_dosis=form.dosis.data,
                    med_prescribed_by=form.prescribed_by.data,
                    med_diagnosis=form.diagnosis.data,
                    med_quantity=form.quantity.data)
            ]
        )
    session = db.getSession(engine) #med = current_user
    session.add(med)
    session.commit()
    return redirect('/success')

@app.route('/medications', methods=['POST'])
def post_medication():
    brand = request.form['med_brand_name']
    drug = request.form['med_drug']
    dosis = request.form['med_dosis']
    prescribed_by = request.form['med_prescribed_by']
    diagnosis = request.form['med_diagnosis']
    quantity = request.form['med_quantity']
    medication = entities.Medication(
                        med_brand_name = brand,
                        med_drug = drug,
                        med_dosis = dosis,
                        med_prescribed_by = prescribed_by,
                        med_diagnosis = diagnosis,
                        med_quantity = quantity)
    if not med_brand_name == "":
        session = db.getSession(engine)
        session.add(medication)
        session.commit()
        return 'Create New Medication'
    return render_template("fail.html")

@app.route('/medications', methods=['GET'])
def medications():
    data = []
    session = db.getSession(engine)
    for user_med in session.query(entities.User_med):
        for medications in user_med.medication:
            if session.query(entities.User_med).filter_by(user=current_user.id).first():
                data.append(medications)
    return Response(json.dumps(data, cls=connector.AlchemyEncoder), mimetype='application/json')


# ------------------- L A B O R A T O R Y -------------------
@app.route('/labs', methods=['GET'])
def get_laboratories():
    session = db.getSession(engine)
    data = []
    session = db.getSession(engine)
    for hemograma in session.query(entities.Hemograma):
        if session.query(entities.Hemograma).filter_by(user_id=current_user.id).first():
            data.append(hemograma)
    return Response(json.dumps(data, cls=connector.AlchemyEncoder), mimetype='application/json')

@app.route('/laboratories', methods=['GET'])
def laboratories():
    session = db.getSession(engine)
    return render_template('laboratory.html')


@app.route('/hemograma', methods=['GET'])
def new_hemograma():
    form = hemograma_form()
    return render_template('hemograma.html', form=form)


@app.route('/get_hemograma/<id>', methods=['GET'])
def get_hemograma(id):
    session = db.getSession(engine)
    data = []
    hemogramas = session.query(entities.Hemograma).filter(entities.Hemograma.id == id)
    for hemograma in hemogramas:
        data.append(hemograma)
    return Response(json.dumps(data, cls=connector.AlchemyEncoder), mimetype='application/json')

@app.route('/hemograma/<id>', methods=['GET'])
def hemograma(id):
    session = db.getSession(engine)
    data = []
    hemogramas = session.query(entities.Hemograma).filter(entities.Hemograma.id == id)
    for hemograma in hemogramas:
        data.append(hemograma)
    return render_template('hemograma_lab.html', data=data)

@app.route('/add_hemograma', methods=['POST'])
def add_hemograma():
    form = hemograma_form()
    session = db.getSession(engine)
    hemograma = Hemograma(
                user_id=current_user.id,
                day=form.day.data,
                month=form.month.data,
                year=form.year.data,
                doctor=form.doctor.data,
                rcto_hematies=form.rcto_hematies.data,
                rcto_leucocitos=form.rcto_leucocitos.data,
                eosinofilos=form.eosinofilos.data,
                basofilos=form.basofilos.data,
                abastonados=form.abastonados.data,
                segmentados=form.segmentados.data,
                linfocitos=form.linfocitos.data,
                monocitos=form.monocitos.data,
                diferencial_total=form.diferencial_total.data,
                hemoglobina_hb=form.hemoglobina_hb.data,
                hematocrito_hto=form.hematocrito_hto.data,
                volumen_corpuscular_media=form.volumen_corpuscular_media.data,
                hemoglobina_corpuscular_media=form.hemoglobina_corpuscular_media.data,
                conc_hb_corpuscular_media=form.conc_hb_corpuscular_media.data,
                eosinofilos_abs=form.eosinofilos_abs.data,
                basofilos_abs=form.basofilos_abs.data,
                abastonados_abs=form.abastonados_abs.data,
                segmentados_abs=form.segmentados_abs.data,
                linfocitos_abs=form.linfocitos_abs.data,
                monocitos_abs=form.monocitos_abs.data,
                rcto_plaquetas=form.rcto_plaquetas.data)
    print('here')
    session.add(hemograma)
    session.commit()
    return redirect('/success')

# ---------------------- U S E R S -------------------------
# crear user
@app.route('/users', methods=['POST'])
def post_users():
    email = request.form['email']
    username = request.form['username']
    name = request.form['name']
    password = request.form['password']
    user = entities.User( email = email,
                          username = username,
                          name = name,
                          password = password)
    session = db.getSession(engine)
    session.add(user)
    session.commit()
    return 'Create User'


# get user info
@app.route('/user', methods=['GET'])
def user_info():
    sessiondb = db.getSession(engine)
    user = sessiondb.query(entities.User).filter(
        entities.User.id == current_user.id).first()

    return Response(json.dumps(user, cls=connector.AlchemyEncoder),
                    mimetype='application/json')


@app.route('/user/<username>')
def user(username):
    user = users.query.filter_by(username=username).first_or_404()
    return render_template('home.html', username=username)

# get all users
@app.route('/users', methods=['GET'])
def users():
    key = "GetUsers"
    if key not in cache.keys():
        session = db.getSession(engine)
        users = session.query(entities.User)
        cache[key] = users
        print("From DB")

    else:
        print("From cache")

    data = []

    for user in cache[key]:
        data.append(user)
    return Response(json.dumps(data, cls=connector.AlchemyEncoder), mimetype='application/json')


if __name__ == '__main__':
    # app.run()
    app.secret_key = ".."
    app.run(port=8800, threaded=True, host=('0.0.0.0'))
