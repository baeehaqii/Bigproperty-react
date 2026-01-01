<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\KreditUser;
use App\Models\Visitor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    /**
     * Register new user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Buat user baru
            $user = User::create([
                'username' => $request->username,
                'email' => $request->email,
                'firstname' => $request->firstname,
                'lastname' => $request->lastname,
                'password' => Hash::make($request->password),
            ]);

            $user->assignRole('visitor');

            if($user){
                Visitor::create([
                    "user_id" => $user->id,
                    "nama" => $request->firstname . " " . $request->lastname
                ]);
            }
            // Generate token
            $token = JWTAuth::fromUser($user);

            return response()->json([
                'success' => true,
                'message' => 'User registered successfully',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'username' => $user->username,
                        'email' => $user->email,
                        'firstname' => $user->firstname,
                        'lastname' => $user->lastname,
                        'name' => $user->name,
                        'roles' => $user->roles->pluck('name'), // Tambahin roles
                    ],
                    'kredit' => $user->kreditUser,
                    'access_token' => $token,
                    'token_type' => 'bearer',
                    'expires_in' => config('jwt.ttl') * 60
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $credentials = $request->only('email', 'password');

        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid email or password'
                ], 401);
            }

            $user = auth()->user();

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'username' => $user->username,
                        'email' => $user->email,
                        'firstname' => $user->firstname,
                        'lastname' => $user->lastname,
                        'name' => $user->name,
                    ],
                    'kredit' => $user->kreditUser,
                    'access_token' => $token,
                    'token_type' => 'bearer',
                    'expires_in' => config('jwt.ttl') * 60
                ]
            ], 200);

        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Could not create token',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get authenticated user
     */
    public function me()
    {
        try {
            $user = auth()->user();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'username' => $user->username,
                        'email' => $user->email,
                        'firstname' => $user->firstname,
                        'lastname' => $user->lastname,
                        'name' => $user->name,
                    ],
                    'kredit' => $user->kreditUser,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Logout user
     */
    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());

            return response()->json([
                'success' => true,
                'message' => 'Successfully logged out'
            ], 200);

        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to logout',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Refresh token
     */
    public function refresh()
    {
        try {
            $newToken = JWTAuth::refresh(JWTAuth::getToken());

            return response()->json([
                'success' => true,
                'message' => 'Token refreshed successfully',
                'data' => [
                    'access_token' => $newToken,
                    'token_type' => 'bearer',
                    'expires_in' => config('jwt.ttl') * 60
                ]
            ], 200);

        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Could not refresh token',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'sometimes|string|max:255|unique:users,username,' . auth()->id(),
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . auth()->id(),
            'firstname' => 'sometimes|string|max:255',
            'lastname' => 'sometimes|string|max:255',
            'password' => 'sometimes|string|min:8|confirmed',
            'ktp' => 'sometimes|string|max:255',
            'no_wa' => 'sometimes|string|max:255',
            'photo' => 'sometimes|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = auth()->user();
            
            // Data yang akan di-update di tabel users
            $userData = [];
            
            if ($request->has('username')) {
                $userData['username'] = $request->username;
            }
            
            if ($request->has('email')) {
                $userData['email'] = $request->email;
            }
            
            if ($request->has('firstname')) {
                $userData['firstname'] = $request->firstname;
            }
            
            if ($request->has('lastname')) {
                $userData['lastname'] = $request->lastname;
            }
            
            if ($request->has('password')) {
                $userData['password'] = Hash::make($request->password);
            }
            
            // Update user
            if (!empty($userData)) {
                $user->update($userData);
            }
            
            // Cek apakah firstname atau lastname berubah
            $nameChanged = $request->has('firstname') || $request->has('lastname');
            
            // Ambil nilai terbaru firstname dan lastname
            $firstname = $request->has('firstname') ? $request->firstname : $user->firstname;
            $lastname = $request->has('lastname') ? $request->lastname : $user->lastname;
            $fullName = $firstname . ' ' . $lastname;
            
            // Cek role user dan update tabel terkait
            if ($user->hasRole('visitor')) {
                // Data untuk update tabel visitor
                $visitorData = [];
                
                if ($nameChanged) {
                    $visitorData['nama'] = $fullName;
                }
                
                if ($request->has('ktp')) {
                    $visitorData['ktp'] = $request->ktp;
                }
                
                if ($request->has('no_wa')) {
                    $visitorData['no_wa'] = $request->no_wa;
                }
                
                if ($request->has('photo')) {
                    $visitorData['photo'] = $request->photo;
                }
                
                // Update jika ada data yang berubah
                if (!empty($visitorData)) {
                    Visitor::where('user_id', $user->id)->update($visitorData);
                }
            } 
            elseif ($user->hasRole('agen') || $user->hasRole('developer')) {
                // Data untuk update tabel agen
                $agenData = [];
                
                if ($nameChanged) {
                    $agenData['name'] = $fullName;
                }
                
                if ($request->has('ktp')) {
                    $agenData['ktp'] = $request->ktp;
                }
                
                if ($request->has('no_wa')) {
                    $agenData['phone'] = $request->no_wa; // di tabel agen kolom nya 'phone'
                }
                
                if ($request->has('photo')) {
                    $agenData['photo'] = $request->photo;
                }
                
                // Update jika ada data yang berubah
                if (!empty($agenData)) {
                    \App\Models\Agen::where('user_id', $user->id)->update($agenData);
                }
            }
            
            // Refresh user data
            $user->refresh();
            
            // Load data visitor atau agen sesuai role
            $additionalData = null;
            if ($user->hasRole('visitor')) {
                $additionalData = Visitor::where('user_id', $user->id)->first();
            } elseif ($user->hasRole('agen') || $user->hasRole('developer')) {
                $additionalData = \App\Models\Agen::where('user_id', $user->id)->first();
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'username' => $user->username,
                        'email' => $user->email,
                        'firstname' => $user->firstname,
                        'lastname' => $user->lastname,
                        'name' => $user->name,
                        'roles' => $user->roles->pluck('name'),
                    ],
                    'kredit' => $user->kreditUser,
                    'profile_data' => $additionalData, // Data visitor atau agen
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Update profile failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}