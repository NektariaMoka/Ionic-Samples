import { inject, Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  signInAnonymously,
  sendEmailVerification,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable, from } from 'rxjs';
import {
  User,
  UserProfile,
  AuthCredentials,
  SignupData,
  AuthResponse,
} from '../models/user.interface';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private loadingService = inject(LoadingService);
  constructor() {
    // Listen to auth state changes
    this.auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const user = await this.mapFirebaseUserToUser(firebaseUser);
        this.currentUserSubject.next(user);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  async signup(signupData: SignupData): Promise<AuthResponse> {
    try {
      await this.loadingService.showLoading('Creating your account...');

      // Validate passwords match
      if (signupData.password !== signupData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        signupData.email,
        signupData.password,
      );

      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, {
        displayName: `${signupData.firstName} ${signupData.lastName}`,
      });

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        preferences: {
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          privacy: {
            profileVisibility: 'public',
            showEmail: false,
            showPhone: false,
          },
          theme: 'auto',
          language: 'en',
        },
      };

      await this.createUserDocument(firebaseUser.uid, userProfile);

      // Send email verification
      await sendEmailVerification(firebaseUser);

      const user = await this.mapFirebaseUserToUser(firebaseUser);

      await this.loadingService.hideLoading();
      await this.loadingService.showToast(
        'Account created successfully! Please check your email for verification.',
        'success',
      );

      return { success: true, user };
    } catch (error: any) {
      await this.loadingService.hideLoading();
      const errorMessage = this.getErrorMessage(error);
      await this.loadingService.showToast(errorMessage, 'error');
      return { success: false, error: errorMessage };
    }
  }

  async signin(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      await this.loadingService.showLoading('Signing you in...');

      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password,
      );

      const user = await this.mapFirebaseUserToUser(userCredential.user);

      // Update last login time
      await this.updateLastLogin(user.uid);

      await this.loadingService.hideLoading();
      await this.loadingService.showToast('Welcome back!', 'success');

      return { success: true, user };
    } catch (error: any) {
      await this.loadingService.hideLoading();
      const errorMessage = this.getErrorMessage(error);
      await this.loadingService.showToast(errorMessage, 'error');
      return { success: false, error: errorMessage };
    }
  }

  async signInAnonymously(): Promise<AuthResponse> {
    try {
      await this.loadingService.showLoading('Signing in anonymously...');

      const userCredential = await signInAnonymously(this.auth);
      const user = await this.mapFirebaseUserToUser(userCredential.user);

      await this.loadingService.hideLoading();
      await this.loadingService.showToast('Signed in anonymously', 'success');

      return { success: true, user };
    } catch (error: any) {
      await this.loadingService.hideLoading();
      const errorMessage = this.getErrorMessage(error);
      await this.loadingService.showToast(errorMessage, 'error');
      return { success: false, error: errorMessage };
    }
  }

  async resetPassword(email: string): Promise<boolean> {
    try {
      await this.loadingService.showLoading('Sending reset email...');

      await sendPasswordResetEmail(this.auth, email);

      await this.loadingService.hideLoading();
      await this.loadingService.showToast(
        'Password reset email sent!',
        'success',
      );

      return true;
    } catch (error: any) {
      await this.loadingService.hideLoading();
      const errorMessage = this.getErrorMessage(error);
      await this.loadingService.showToast(errorMessage, 'error');
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      await this.loadingService.showToast('Signed out successfully', 'success');
    } catch (error: any) {
      await this.loadingService.showToast('Error signing out', 'error');
    }
  }

  async updateUserProfile(
    uid: string,
    profileData: Partial<UserProfile>,
  ): Promise<boolean> {
    try {
      const userDocRef = doc(this.firestore, 'users', uid);
      await updateDoc(userDocRef, {
        profile: profileData,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDocRef = doc(this.firestore, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        return data['profile'] || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAnonymous(): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.isAnonymous : false;
  }

  private async createUserDocument(
    uid: string,
    profile: UserProfile,
  ): Promise<void> {
    const userDocRef = doc(this.firestore, 'users', uid);
    await setDoc(userDocRef, {
      profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
  }

  private async updateLastLogin(uid: string): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, 'users', uid);
      await updateDoc(userDocRef, {
        lastLoginAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  private async mapFirebaseUserToUser(
    firebaseUser: FirebaseUser,
  ): Promise<User> {
    const profile = await this.getUserProfile(firebaseUser.uid);

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      isAnonymous: firebaseUser.isAnonymous,
      createdAt: firebaseUser.metadata.creationTime
        ? new Date(firebaseUser.metadata.creationTime)
        : new Date(),
      lastLoginAt: firebaseUser.metadata.lastSignInTime
        ? new Date(firebaseUser.metadata.lastSignInTime)
        : new Date(),
      profile,
    };
  }

  private getErrorMessage(error: any): string {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
}
