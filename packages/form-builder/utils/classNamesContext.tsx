import React, { createContext, useContext } from 'react';

import { FormBuilderAnimationConfig, FormBuilderClassNames } from '../types';

interface FormBuilderContextValue {
  classNames: FormBuilderClassNames;
  animationConfig: FormBuilderAnimationConfig;
}

const FormBuilderContext = createContext<FormBuilderContextValue>({
  classNames: {},
  animationConfig: {},
});

export const FormBuilderConfigProvider: React.FC<{
  classNames?: FormBuilderClassNames;
  animationConfig?: FormBuilderAnimationConfig;
  children: React.ReactNode;
}> = ({ classNames = {}, animationConfig = {}, children }) => {
  return <FormBuilderContext.Provider value={{ classNames, animationConfig }}>{children}</FormBuilderContext.Provider>;
};

export const useFormBuilderClassNames = (): FormBuilderClassNames => {
  return useContext(FormBuilderContext).classNames;
};

export const useFormBuilderAnimationConfig = (): FormBuilderAnimationConfig => {
  return useContext(FormBuilderContext).animationConfig;
};

// Backward compatibility
export const FormBuilderClassNamesProvider = FormBuilderConfigProvider;
