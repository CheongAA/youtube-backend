import { Sequelize } from 'sequelize';

export default (sequelize, DataTypes) => {
  return sequelize.define('VideoLike', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4
    },
    like: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
}
