import os
import argparse
import warnings
from sqlalchemy import create_engine, Column, ForeignKey, Integer, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

with warnings.catch_warnings():
    warnings.simplefilter("ignore")
    engine = create_engine(os.environ['DB_CONN'])
Session = sessionmaker(bind=engine)

Base = declarative_base()

class Dump(Base):
    __tablename__ = 'dump'
    instr = Column(String, primary_key=True)
    date = Column(String, primary_key=True)
    vars = Column(String, primary_key=True)
    lower = Column(String, primary_key=True)
    upper = Column(String, primary_key=True)
    created = Column(DateTime, nullable=False)
    payload = Column(String, nullable=False)
    errors = Column(String, nullable=False)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="DB stuff")
    parser.add_argument('-b', '--build', action="store_true", help="Builds the database")
    parser.add_argument('-n', '--nuke', action="store_true", help="Nukes the db")

    args = parser.parse_args()
    session = Session()
    if args.nuke:
        Base.metadata.drop_all(engine)
        print("DB Nuked")
    if args.build:
        Base.metadata.create_all(engine)
        print("DB Created")


