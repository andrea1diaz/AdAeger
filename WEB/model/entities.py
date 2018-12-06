from sqlalchemy import Column, Integer, String, Sequence, DateTime, ForeignKey,\
event, literal_column, Float
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import relationship, column_property, backref
from sqlalchemy.ext.associationproxy import association_proxy
from werkzeug.security import generate_password_hash, check_password_hash
from database import connector
from flask import Flask
from flask_login import UserMixin, LoginManager
from datetime import datetime

app = Flask(__name__)
# db = connector.Manager()
# engine = db.createEngine()
login = LoginManager(app)
login.login_view = 'login'


class User(connector.Manager.Base, UserMixin):
    __tablename__ = 'users'
    id = Column(Integer, Sequence('user_id_seq'), primary_key=True)
    address_association_id = Column(Integer, ForeignKey("address_association.id"))
    email = Column(String(50))
    name = Column(String(50))
    lastname = Column(String(50))
    fullname = column_property(name + " " + lastname)
    password = Column(String(12))
    username = Column(String(12))
    day = Column(Integer)
    month = Column(String(12))
    year = Column(Integer)
    blood_type = Column(String(10))
    weight = Column(Integer)
    height = Column(Integer)
    med = relationship("MedicationAssociation")

    def __init__(self, name=None, email=None, password=None, username=None):
        self.name = name
        self.email = email
        self.password = password
        self.username = username

    def __repr__(self):
        return '<User {}>'.format(self.username)

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def json(self):
        return {'username': self.username, 'password': self.password}


class MedicationAssociation(connector.Manager.Base):
    __tablename__ = 'address_association'.lower()
    id = Column(Integer, primary_key=True)
    discriminator = Column(String)
    __mapper_args__ = {"polymorphic_on": discriminator}


class Medication(connector.Manager.Base):
    __tablename__ = 'medications'.lower()
    id = Column(Integer, primary_key=True)
    association_id = Column(Integer, ForeignKey("address_association.id"))
    med_brand_name = Column(String(50))
    med_drug = Column(String(50))
    med_dosis = Column(String(50))
    med_prescribed_by = Column(String(50))
    med_diagnosis = Column(String(50))
    med_quantity = Column(String(10))
    association = relationship("MedicationAssociation", backref="medication")
    parent = association_proxy("association", "parent")

    def __repr__(self):
        return "%s(med_brand_name=%r, med_drug=%r, med_dosis=%r, med_prescribed_by=%r, med_diagnosis=%r, med_quantity=%r)" % \
                (self.__class__.__name__, self.med_brand_name,
                 self.med_drug, self.med_dosis, self.med_drug,
                 self.med_dosis, self.med_quantity)


class HasMedication(object):
    @declared_attr
    def address_association(cls):
        user = cls.__name__
        discriminator = user
        assoc_cls = type(
                        "%sMedicationAssociation" % user,
                        (MedicationAssociation, ),
                        dict(
                            __tablename__=None,
                            __mapper_args__={
                                "polymorphic_identity": discriminator
                            }
                        )
                    )

        cls.medication = association_proxy(
                    "address_association", "medication",
                    creator=lambda medication: assoc_cls(medication=medication)
                )
        return relationship(assoc_cls,
                    backref=backref("parent", uselist=False))


class User_med(HasMedication, connector.Manager.Base):
    __tablename__ = 'user_med'
    id = Column(Integer, primary_key=True)
    address_association_id = Column(Integer, ForeignKey("address_association.id"))
    user = Column(String)


@login.user_loader
def load_user(id):
    return session.query(entities.User).get(int(id))


class Symptoms(connector.Manager.Base):
    __tablename__ = 'symptoms'
    id = Column(Integer, Sequence('symptom_id_seq'), primary_key=True)
    description = Column(String(500))
    user_id = Column(Integer, ForeignKey('users.id'))
    user = relationship(User, foreign_keys=[user_id])


# ------------------- L A B O R A T O R I O S -----------------------
class Hemograma(connector.Manager.Base):
    __tablename__ = 'hemograma'
    id = Column(Integer, Sequence('hemograma_id_seq'), primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    user = relationship(User, foreign_keys=[user_id])
    day = Column(Integer)
    month = Column(String(12))
    year = Column(Integer)
    doctor = Column(String)
    rcto_hematies = Column(Integer)
    rcto_leucocitos = Column(Integer)
    eosinofilos = Column(Integer)
    basofilos = Column(Integer)
    abastonados = Column(Integer)
    segmentados = Column(Integer)
    linfocitos = Column(Integer)
    monocitos = Column(Integer)
    diferencial_total = Column(Integer)
    hemoglobina_hb = Column(Float)
    hematocrito_hto = Column(Float)
    volumen_corpuscular_media = Column(Float)
    hemoglobina_corpuscular_media = Column(Float)
    conc_hb_corpuscular_media = Column(Float)
    eosinofilos_abs = Column(Integer)
    basofilos_abs = Column(Integer)
    abastonados_abs = Column(Integer)
    segmentados_abs = Column(Integer)
    linfocitos_abs = Column(Integer)
    monocitos_abs = Column(Integer)
    rcto_plaquetas = Column(Integer)



#Hemograma.__table__.drop(engine)
#MedicationAssociation.__table__.drop(engine)
#User.__table__.drop(engine)
